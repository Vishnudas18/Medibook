import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Availability from '@/models/Availability';
import DoctorProfile from '@/models/DoctorProfile';
import { getAuthUser, requireRole } from '@/lib/auth';
import { availabilitySchema } from '@/schemas/doctor.schema';

/**
 * GET — Fetch all availability settings for the current doctor
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

    const availabilities = await Availability.find({
      doctorId: doctorProfile._id,
    }).sort({ dayOfWeek: 1 }).lean();

    return Response.json({
      success: true,
      data: availabilities,
    });
  } catch (error: any) {
    console.error('Fetch availability error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message.includes('token') ? 401 : 500 }
    );
  }
}

/**
 * POST — Create or update availability for a doctor
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, 'doctor');

    const body = await request.json();
    const parsed = availabilitySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const doctorProfile = await DoctorProfile.findOne({ userId: user.userId }).lean();
    if (!doctorProfile) {
      return Response.json(
        { success: false, error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const availability = await Availability.findOneAndUpdate(
      {
        doctorId: doctorProfile._id,
        dayOfWeek: parsed.data.dayOfWeek,
      },
      {
        ...parsed.data,
        doctorId: doctorProfile._id,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return Response.json({
      success: true,
      data: availability,
      message: 'Availability updated successfully',
    });
  } catch (error: any) {
    console.error('Update availability error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
