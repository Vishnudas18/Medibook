import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return Response.json(
        { success: false, error: 'No refresh token' },
        { status: 200 }
      );
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return Response.json(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get fresh user data
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return Response.json(
        { success: false, error: 'Account deactivated' },
        { status: 403 }
      );
    }

    // Sign new access token
    const accessToken = signAccessToken(user._id.toString(), user.role);

    return Response.json({
      success: true,
      data: {
        accessToken,
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
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return Response.json(
      { success: false, error: 'Session expired' },
      { status: 200 }
    );
  }
}
