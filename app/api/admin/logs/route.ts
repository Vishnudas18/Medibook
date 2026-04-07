import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import SystemLog from '@/models/SystemLog';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return Response.json(
        { success: false, error: 'Unauthorized — Admin access only' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    await connectDB();

    const query = type && type !== 'all' ? { type } : {};

    const logs = await SystemLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return Response.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Fetch system logs error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
