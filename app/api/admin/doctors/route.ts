import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import DoctorProfile from '@/models/DoctorProfile';
import { getAuthUser, requireRole } from '@/lib/auth';
import { sendDoctorApprovalEmail, sendDoctorRejectionEmail } from '@/lib/mail';
import User from '@/models/User';

/**
 * GET — Fetch all doctors with their current status (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, 'admin');

    await connectDB();
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');

    let filter = {};
    if (status) filter = { status };

    const doctors = await DoctorProfile.find(filter)
      .populate('userId', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: doctors,
    });
  } catch (error: any) {
    console.error('Fetch admin doctors error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH — Approve or Reject a doctor registration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    // This will be handled in a dynamic route [id]/approve
    // For now, I'll put the logic here or in the specific folder as per the structure.
    return Response.json({ success: false, error: 'Use /api/admin/doctors/[id]/approve instead' });
}
