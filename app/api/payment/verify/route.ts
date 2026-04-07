import { NextRequest } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import Appointment from '@/models/Appointment';
import { getAuthUser } from '@/lib/auth';
import { verifyPaymentSchema } from '@/schemas/payment.schema';
import { releaseSlot } from '@/lib/redis';
import { sendBookingConfirmation, sendNewBookingNotification } from '@/lib/mail';
import { format } from 'date-fns';
import User from '@/models/User';
import DoctorProfile from '@/models/DoctorProfile';

/**
 * POST — Verify Razorpay signature and finalize booking
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const body = await request.json();

    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentData } = parsed.data;

    const isRedisConfigured = 
      process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL.includes('your_');

    // 1. Verify Signature (Skip if dummy)
    let isDummy = false;
    if (razorpay_signature === 'dummy_signature') {
      isDummy = true;
    } else {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return Response.json(
          { success: false, error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // 2. Create Payment Document
    const amountInPaise = await DoctorProfile.findById(appointmentData.doctorId)
      .select('consultationFee')
      .then(d => (d?.consultationFee || 0) * 100);

    const payment = await Payment.create({
      patientId: user.userId,
      doctorId: appointmentData.doctorId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: amountInPaise,
      status: 'paid',
      paidAt: new Date(),
    });

    // 3. Create Appointment Document
    const appointment = await Appointment.create({
      patientId: user.userId,
      doctorId: appointmentData.doctorId,
      date: new Date(appointmentData.date),
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      reason: appointmentData.reason,
      status: 'confirmed',
      isPaid: true,
      paymentId: payment._id,
    });

    // Update payment with appointment ID
    payment.appointmentId = appointment._id;
    await payment.save();

    // 4. Release Redis Lock (Only if Redis is configured and it's not a dummy flow)
    if (!isDummy && isRedisConfigured) {
      await releaseSlot(appointmentData.doctorId, appointmentData.date, appointmentData.startTime);
    }

    // 5. Send Confirmation Emails
    const patientDoc = await User.findById(user.userId).lean();
    const doctorProfileDoc = await DoctorProfile.findById(appointmentData.doctorId)
      .populate('userId', 'name email')
      .lean();

    if (patientDoc && doctorProfileDoc) {
      const doctorUser = (doctorProfileDoc.userId as any);
      const dateFormatted = format(new Date(appointmentData.date), 'PPP');

      try {
        // To Patient
        await sendBookingConfirmation({
          patientEmail: patientDoc.email,
          patientName: patientDoc.name,
          doctorName: doctorUser.name,
          date: dateFormatted,
          time: appointmentData.startTime,
          clinicName: (doctorProfileDoc as any).clinicName,
          fee: `₹${(doctorProfileDoc as any).consultationFee}`,
        });

        // To Doctor
        await sendNewBookingNotification({
          doctorEmail: doctorUser.email,
          doctorName: doctorUser.name,
          patientName: patientDoc.name,
          date: dateFormatted,
          time: appointmentData.startTime,
          reason: appointmentData.reason,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // We don't fail the request if emails fail
      }
    }

    return Response.json({
      success: true,
      data: appointment,
      message: 'Payment verified and appointment booked successfully',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
