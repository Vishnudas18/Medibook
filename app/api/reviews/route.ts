import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Appointment from '@/models/Appointment';
import DoctorProfile from '@/models/DoctorProfile';
import { getAuthUser, requireRole } from '@/lib/auth';
import { reviewSchema } from '@/schemas/review.schema';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, 'patient');

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { appointmentId, rating, comment } = parsed.data;

    await connectDB();

    // 1. Verify appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return Response.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // 2. Security Check: Only the patient of the appointment can review
    if (appointment.patientId.toString() !== user.userId) {
      return Response.json(
        { success: false, error: 'Unauthorized: You can only review your own appointments' },
        { status: 403 }
      );
    }

    // 3. Status Check: Only completed appointments can be reviewed
    if (appointment.status !== 'completed') {
      return Response.json(
        { success: false, error: 'Only completed appointments can be reviewed' },
        { status: 400 }
      );
    }

    // 4. Check for existing review
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return Response.json(
        { success: false, error: 'You have already reviewed this appointment' },
        { status: 409 }
      );
    }

    // 5. Create Review
    const review = await Review.create({
      patientId: user.userId,
      doctorId: appointment.doctorId,
      appointmentId,
      rating,
      comment,
    });

    // 6. Update Doctor Rating
    const doctorProfile = await DoctorProfile.findById(appointment.doctorId);
    if (doctorProfile) {
      const currentTotal = doctorProfile.totalRatings || 0;
      const currentRating = doctorProfile.rating || 0;
      
      const newTotal = currentTotal + 1;
      const newRating = (currentRating * currentTotal + rating) / newTotal;

      doctorProfile.totalRatings = newTotal;
      doctorProfile.rating = Number(newRating.toFixed(1));
      await doctorProfile.save();
    }

    return Response.json(
      {
        success: true,
        message: 'Review submitted successfully',
        data: review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Submit review error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
