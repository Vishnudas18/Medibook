import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const reviews = await Review.find({ doctorId: id })
      .populate('patientId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error('Fetch doctor reviews error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
