import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

/**
 * GET — Fetch all users for the admin dashboard
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

    // Fetch all users, omitting the password field 
    // and sorting by most recently created
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Admin Fetch Users Error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
