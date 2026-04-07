import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import DoctorProfile from '@/models/DoctorProfile';
import User from '@/models/User';
import { getAuthUser, requireRole } from '@/lib/auth';
import { sendDoctorApprovalEmail, sendDoctorRejectionEmail } from '@/lib/mail';

/**
 * PATCH — Approve or Reject a doctor registration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    requireRole(user, 'admin');

    const { id } = await params;
    const { status, reason } = await request.json();
    if (!status || !['approved', 'rejected'].includes(status)) {
      return Response.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectDB();

    const doctorProfile = await DoctorProfile.findById(id).populate('userId', 'name email');
    if (!doctorProfile) {
      return Response.json(
        { success: false, error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    if (!doctorProfile.userId) {
      return Response.json(
        { success: false, error: 'Associated user account not found' },
        { status: 404 }
      );
    }

    doctorProfile.status = status;
    if (reason) doctorProfile.rejectionReason = reason;
    await doctorProfile.save();

    const doctorUser = (doctorProfile.userId as any);

    // Send emails
    try {
    if (status === 'approved') {
      await sendDoctorApprovalEmail({
        doctorEmail: doctorUser.email,
        doctorName: doctorUser.name,
      });
    } else if (status === 'rejected') {
      await sendDoctorRejectionEmail({
        doctorEmail: doctorUser.email,
        doctorName: doctorUser.name,
        reason: reason || 'Credentials could not be verified.',
      });
    }
    } catch (emailError) {
      console.error('Non-fatal error: Failed to send notification email', emailError);
    }

    return Response.json({
      success: true,
      message: `Doctor registration ${status} successfully`,
      data: doctorProfile,
    });
  } catch (error: any) {
    console.error('Update doctor approval error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
