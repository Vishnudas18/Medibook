import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import LeaveDate from '@/models/LeaveDate';
import DoctorProfile from '@/models/DoctorProfile';
import { getAuthUser, requireRole } from '@/lib/auth';
import { leaveSchema } from '@/schemas/doctor.schema';

/**
 * GET — Fetch all leave dates for the logged-in doctor
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

    const leaves = await LeaveDate.find({
      doctorId: doctorProfile._id,
      date: { $gte: new Date() }, // Only future leaves
    }).sort({ date: 1 }).lean();

    return Response.json({
      success: true,
      data: leaves,
    });
  } catch (error: any) {
    console.error('Fetch leaves error:', error);
    const status = error.message?.includes('token') ? 401 : 500;
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}

/**
 * POST — Block a date (Leave)
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, 'doctor');

    const body = await request.json();
    const parsed = leaveSchema.safeParse(body);
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

    // Check if already blocked
    const leaveDate = new Date(parsed.data.date);
    leaveDate.setHours(0,0,0,0);
    
    const existingLeave = await LeaveDate.findOne({
      doctorId: doctorProfile._id,
      date: leaveDate,
    }).lean();

    if (existingLeave) {
      return Response.json(
        { success: false, error: 'This date is already blocked' },
        { status: 409 }
      );
    }

    const leave = await LeaveDate.create({
      doctorId: doctorProfile._id,
      date: leaveDate,
      reason: parsed.data.reason,
    });

    return Response.json({
      success: true,
      data: leave,
      message: 'Date blocked successfully',
    });
  } catch (error: any) {
    console.error('Create leave error:', error);
    const status = error.message?.includes('token') ? 401 : 500;
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}

/**
 * DELETE — Unblock a date
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, 'doctor');

    const { id } = await request.json();

    await connectDB();
    await LeaveDate.findByIdAndDelete(id);

    return Response.json({
      success: true,
      message: 'Date unblocked successfully',
    });
  } catch (error: any) {
    console.error('Delete leave error:', error);
    const status = error.message?.includes('token') ? 401 : 500;
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}
