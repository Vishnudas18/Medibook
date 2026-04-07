import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import DoctorProfile from '@/models/DoctorProfile';
import User from '@/models/User';
import { getAuthUser, requireRole } from '@/lib/auth';
import { updateDoctorProfileSchema } from '@/schemas/doctor.schema';

// GET: Fetch the logged-in doctor's own profile
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    requireRole(authUser, 'doctor');

    await connectDB();

    const [user, doctorProfile] = await Promise.all([
      User.findById(authUser.userId).lean(),
      DoctorProfile.findOne({ userId: authUser.userId }).lean(),
    ]);

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
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
    console.error('Fetch doctor profile error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('token') ? 401 : 500;
    return Response.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}

// PUT: Update the logged-in doctor's profile
export async function PUT(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    requireRole(authUser, 'doctor');

    await connectDB();

    const body = await request.json();
    const { name, phone, ...profileData } = body;

    // Validate profile data (partial — only provided fields are validated)
    const parsed = updateDoctorProfileSchema.safeParse(profileData);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Update user fields (name, phone) if provided
    const userUpdate: Record<string, string> = {};
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      userUpdate.name = name.trim();
    }
    if (phone && typeof phone === 'string' && phone.trim().length >= 6) {
      userUpdate.phone = phone.trim();
    }

    const [updatedUser, updatedProfile] = await Promise.all([
      Object.keys(userUpdate).length > 0
        ? User.findByIdAndUpdate(authUser.userId, userUpdate, { new: true }).lean()
        : User.findById(authUser.userId).lean(),
      Object.keys(parsed.data).length > 0
        ? DoctorProfile.findOneAndUpdate(
            { userId: authUser.userId },
            parsed.data,
            { new: true }
          ).lean()
        : DoctorProfile.findOne({ userId: authUser.userId }).lean(),
    ]);

    if (!updatedUser || !updatedProfile) {
      return Response.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          isVerified: updatedUser.isVerified,
          isActive: updatedUser.isActive,
        },
        doctorProfile: updatedProfile,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    const status = errorMessage.includes('token') ? 401 : 500;
    return Response.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
