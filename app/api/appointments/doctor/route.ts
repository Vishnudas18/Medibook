import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import { getAuthUser, requireRole } from '@/lib/auth';
import DoctorProfile from '@/models/DoctorProfile';
import User from '@/models/User';

/**
 * GET — Fetch all appointments for the logged-in doctor
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, 'doctor');

    await connectDB();

    const doctorProfile = await DoctorProfile.findOne({ userId: user.userId }).lean();
    if (!doctorProfile) {
      return Response.json(
        { success: false, error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const appointments = await Appointment.find({ doctorId: doctorProfile._id })
      .populate('patientId', 'name email avatar phone')
      .sort({ date: -1, startTime: -1 })
      .lean();

    return Response.json({
      success: true,
      data: appointments,
    });
  } catch (error: any) {
    console.error('Fetch doctor appointments error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
