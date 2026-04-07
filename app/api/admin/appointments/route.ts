import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import DoctorProfile from '@/models/DoctorProfile';
import { getAuthUser } from '@/lib/auth';

/**
 * GET — Fetch all appointments for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    // Ensure only admins can access this endpoint
    if (user.role !== 'admin') {
      return Response.json(
        { success: false, error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    // Fetch all appointments, sorted by most recent
    // Populate patient info (User model)
    // Populate doctor info (DoctorProfile model -> populating userId from User model)
    const appointments = await Appointment.find({})
      .sort({ date: -1, startTime: -1 })
      .populate({
        path: 'patientId',
        model: User,
        select: 'name email avatar',
      })
      .populate({
        path: 'doctorId',
        model: DoctorProfile,
        populate: {
          path: 'userId',
          model: User,
          select: 'name email avatar',
        },
      })
      .lean();

    return Response.json({
      success: true,
      data: appointments,
    });
  } catch (error: any) {
    console.error('Admin Fetch Appointments Error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
