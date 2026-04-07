import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import DoctorProfile from '@/models/DoctorProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);

    await connectDB();

    const user = await User.findById(authUser.userId).lean();
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ userId: user._id }).lean();
    }

    return Response.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
        },
        doctorProfile,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('token') ? 401 : 500;
    return Response.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
