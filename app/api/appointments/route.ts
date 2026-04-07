import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';
import DoctorProfile from '@/models/DoctorProfile';

/**
 * GET — Fetch appointments for the current user
 * If patient: returns their bookings
 * If doctor: returns their scheduled patients (requires doctor middleware check usually, but we check here)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    let query = {};
    if (user.role === 'patient') {
      query = { patientId: user.userId };
    } else if (user.role === 'doctor') {
      // Find doctor profile first
      const doctorProfile = await DoctorProfile.findOne({ userId: user.userId }).lean();
      if (!doctorProfile) {
        return Response.json(
          { success: false, error: 'Doctor profile not found' },
          { status: 404 }
        );
      }
      query = { doctorId: doctorProfile._id };
    } else if (user.role === 'admin') {
      query = {}; // Admin sees all
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email avatar phone' },
      })
      .populate('patientId', 'name email avatar phone')
      .sort({ date: -1, startTime: -1 })
      .lean();

    return Response.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('Fetch appointments error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
