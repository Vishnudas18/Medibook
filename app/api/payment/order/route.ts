import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import DoctorProfile from '@/models/DoctorProfile';
import Appointment from '@/models/Appointment';
import { getAuthUser } from '@/lib/auth';
import { createOrderSchema } from '@/schemas/payment.schema';
import { lockSlot, isSlotLocked } from '@/lib/redis';
import razorpay from '@/lib/razorpay';
import Availability from '@/models/Availability';

/**
 * POST — Create a Razorpay order and lock the selected slot
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (user.role !== 'patient') {
      return Response.json(
        { success: false, error: 'Only patients can book appointments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const isMockMode = process.env.NEXT_PUBLIC_PAYMENT_MODE === 'mock';
    const isRazorpayConfigured = 
      process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('your_');
    const isRedisConfigured = 
      process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL.includes('your_');

    const { doctorId, date, startTime } = parsed.data;

    await connectDB();

    // 1. Check if doctor exists and get details
    const doctor = await DoctorProfile.findById(doctorId).lean();
    if (!doctor || doctor.status !== 'approved') {
      return Response.json(
        { success: false, error: 'Doctor not found or not approved' },
        { status: 404 }
      );
    }

    // 2. Check if already booked in DB (Robust Date Parsing)
    const [year, month, day] = date.split('-').map(Number);
    const startOfDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDate = new Date(year, month - 1, day, 23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: { $gte: startOfDate, $lte: endOfDate },
      startTime,
      status: { $nin: ['cancelled'] },
    }).lean();

    if (existingAppointment) {
      return Response.json(
        { success: false, error: 'This slot is already booked' },
        { status: 409 }
      );
    }

    const amount = doctor.consultationFee * 100; // in paise

    // Use Mock Flow if requested or if keys are missing
    if (isMockMode || !isRazorpayConfigured) {
      console.log(`Using ${isMockMode ? 'MOCK' : 'DUMMY'} payment flow.`);
      return Response.json({
        success: true,
        data: {
          orderId: `order_mock_${Date.now()}`,
          amount,
          currency: 'INR',
          key: 'mock_key',
          isDummy: true,
        },
      });
    }

    // --- REAL SYSTEM FLOW ---
    // 3. Check if locked in Redis (Only if Redis is configured)
    if (isRedisConfigured) {
      const locked = await isSlotLocked(doctorId, date, startTime);
      if (locked) {
        return Response.json(
          { success: false, error: 'This slot is currently being booked by someone else.' },
          { status: 409 }
        );
      }

      await lockSlot(doctorId, date, startTime);
    }

    // 5. Create Razorpay order
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { doctorId, patientId: user.userId, date, startTime },
    };

    const order = await razorpay.orders.create(options);

    return Response.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('Payment order error raw details:', error);
    return Response.json(
      { success: false, error: error.message || 'API Error: Check terminal logs for missing API Keys or Razorpay settings.' },
      { status: 500 }
    );
  }
}
