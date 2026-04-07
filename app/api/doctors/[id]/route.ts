import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import DoctorProfile from '@/models/DoctorProfile';
import User from '@/models/User'; // Required for populate

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const doctor = await DoctorProfile.findById(id)
      .populate('userId', 'name email avatar phone')
      .lean();

    if (!doctor) {
      return Response.json(
        { success: false, error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: doctor,
    });
  } catch (error: any) {
    console.error('Fetch doctor details error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
