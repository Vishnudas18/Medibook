import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import { getAuthUser, requireRole } from '@/lib/auth';
import { sendCancellationEmail } from '@/lib/mail';
import { format } from 'date-fns';

/**
 * PATCH — Update appointment status (Doctor/Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getAuthUser(request);
    requireRole(user, 'doctor', 'admin');

    const { status, notes } = await request.json();
    if (!status) {
      return Response.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return Response.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // If doctor, verify it's their appointment
    if (user.role === 'doctor') {
      const doctorProfile = await Appointment.db.models.DoctorProfile.findOne({
        userId: user.userId,
      }).lean();
      if (!doctorProfile || appointment.doctorId.toString() !== doctorProfile._id.toString()) {
        return Response.json(
          { success: false, error: 'Forbidden: not your appointment' },
          { status: 403 }
        );
      }
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    return Response.json({
      success: true,
      data: appointment,
      message: `Appointment ${status} successfully`,
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message.includes('token') ? 401 : 500 }
    );
  }
}

/**
 * DELETE — Cancel appointment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getAuthUser(request);
    const { reason } = await request.json();

    await connectDB();

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!appointment) {
      return Response.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Permission check
    const isPatient = user.role === 'patient' && appointment.patientId._id.toString() === user.userId;
    const isDoctor = user.role === 'doctor'; // Verify doctor ownership below
    const isAdmin = user.role === 'admin';

    if (isDoctor) {
        const doctorProfile = await Appointment.db.models.DoctorProfile.findOne({
          userId: user.userId,
        }).lean();
        if (!doctorProfile || appointment.doctorId._id.toString() !== doctorProfile._id.toString()) {
          return Response.json(
            { success: false, error: 'Forbidden: not your appointment' },
            { status: 403 }
          );
        }
    } else if (!isPatient && !isAdmin) {
      return Response.json(
        { success: false, error: 'Forbidden: insufficient permissions' },
        { status: 403 }
      );
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = reason || 'No reason provided';
    appointment.cancelledBy = user.role;
    await appointment.save();

    // Send emails
    const patient = appointment.patientId as any;
    const doctor = (appointment.doctorId as any).userId as any;
    const dateFormatted = format(new Date(appointment.date), 'PPP');

    // Notify other party
    if (user.role === 'patient') {
      await sendCancellationEmail({
        recipientEmail: doctor.email,
        recipientName: `Dr. ${doctor.name}`,
        cancelledByRole: 'Patient',
        date: dateFormatted,
        time: appointment.startTime,
        reason: appointment.cancelReason,
      });
    } else {
      await sendCancellationEmail({
        recipientEmail: patient.email,
        recipientName: patient.name,
        cancelledByRole: user.role === 'doctor' ? 'Doctor' : 'Administrator',
        date: dateFormatted,
        time: appointment.startTime,
        reason: appointment.cancelReason,
      });
    }

    return Response.json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
