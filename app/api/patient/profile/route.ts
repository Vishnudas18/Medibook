import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser, requireRole } from '@/lib/auth';

// GET: Fetch the logged-in patient's profile
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    requireRole(authUser, 'patient');

    await connectDB();

    const user = await User.findById(authUser.userId).lean();

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Fetch patient profile error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('token') ? 401 : 500;
    return Response.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}

// PUT: Update the logged-in patient's profile
export async function PUT(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    requireRole(authUser, 'patient');

    await connectDB();

    const body = await request.json();
    const { name, phone } = body;

    const userUpdate: Record<string, string> = {};
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      userUpdate.name = name.trim();
    }
    if (phone && typeof phone === 'string' && phone.trim().length >= 10) {
      userUpdate.phone = phone.trim();
    }

    if (Object.keys(userUpdate).length === 0) {
      return Response.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      authUser.userId,
      userUpdate,
      { new: true }
    ).lean();

    if (!updatedUser) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        isVerified: updatedUser.isVerified,
        isActive: updatedUser.isActive,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('token') ? 401 : 500;
    return Response.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
