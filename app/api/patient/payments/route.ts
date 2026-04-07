import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Payment from '@/models/Payment';
import { getAuthUser } from '@/lib/auth';
import DoctorProfile from '@/models/DoctorProfile';

/**
 * GET — Fetch all payments for the current patient
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'patient') {
      return Response.json(
        { success: false, error: 'Unauthorized — Patient access only' },
        { status: 401 }
      );
    }

    await connectDB();

    const payments = await Payment.find({ patientId: user.userId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name avatar phone' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Fetch patient payments error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
