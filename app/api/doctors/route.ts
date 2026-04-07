import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import DoctorProfile from '@/models/DoctorProfile';
import User from '@/models/User';
import { doctorProfileSchema } from '@/schemas/doctor.schema';

// GET: Search doctors (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const specialization = searchParams.get('specialization');
    const city = searchParams.get('city');
    const name = searchParams.get('name');
    const minFee = searchParams.get('minFee');
    const maxFee = searchParams.get('maxFee');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { status: 'approved' };

    if (specialization) filter.specialization = specialization;
    if (city) filter.city = city;
    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = parseInt(minFee);
      if (maxFee) filter.consultationFee.$lte = parseInt(maxFee);
    }

    let query = DoctorProfile.find(filter)
      .populate('userId', 'name email avatar phone')
      .sort({ rating: -1, totalRatings: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (name) {
      // Need to find users matching the name, then filter doctors
      const users = await User.find({
        name: { $regex: name, $options: 'i' },
        role: 'doctor',
      })
        .select('_id')
        .lean();

      const userIds = users.map((u) => u._id);
      filter.userId = { $in: userIds };

      query = DoctorProfile.find(filter)
        .populate('userId', 'name email avatar phone')
        .sort({ rating: -1, totalRatings: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    const [doctors, total] = await Promise.all([
      query,
      DoctorProfile.countDocuments(filter),
    ]);

    return Response.json({
      success: true,
      data: {
        items: doctors,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Register as doctor (creates DoctorProfile)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { userId, ...profileData } = body;

    // Validate profile data
    const parsed = doctorProfileSchema.safeParse(profileData);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if user exists and is a doctor
    const user = await User.findById(userId).lean();
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if profile already exists
    const existingProfile = await DoctorProfile.findOne({ userId }).lean();
    if (existingProfile) {
      return Response.json(
        { success: false, error: 'Doctor profile already exists' },
        { status: 409 }
      );
    }

    // Create doctor profile
    const profile = await DoctorProfile.create({
      userId,
      ...parsed.data,
      status: 'pending',
    });

    return Response.json(
      {
        success: true,
        data: profile,
        message: 'Doctor registration submitted for admin approval',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Doctor register error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
