import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Prescription from '@/models/Prescription';
import { getAuthUser } from '@/lib/auth';

/**
 * GET — Fetch all prescriptions for the current patient
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

    const prescriptions = await Prescription.find({ patientId: user.userId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email avatar phone' },
      })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
