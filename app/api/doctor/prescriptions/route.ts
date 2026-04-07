import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Prescription from '@/models/Prescription';
import Appointment from '@/models/Appointment';
import DoctorProfile from '@/models/DoctorProfile';
import { getAuthUser } from '@/lib/auth';

/**
 * POST — Create a digital prescription for an appointment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'doctor') {
      return Response.json(
        { success: false, error: 'Unauthorized — Doctor access only' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find doctor profile
    const doctorProfile = await DoctorProfile.findOne({ userId: user.userId }).lean();
    if (!doctorProfile) {
      return Response.json(
        { success: false, error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const { appointmentId, medicines, advice, nextFollowUp, notes } = await request.json();
    if (!appointmentId || !medicines || !Array.isArray(medicines)) {
      return Response.json(
        { success: false, error: 'Missing required prescription data' },
        { status: 400 }
      );
    }

    // Verify appointment belongs to this doctor
    const appointment = await Appointment.findById(appointmentId).lean();
    if (!appointment) {
      return Response.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.doctorId.toString() !== doctorProfile._id.toString()) {
      return Response.json(
        { success: false, error: 'Unauthorized — This appointment does not belong to you' },
        { status: 403 }
      );
    }

    // Create prescription
    const newPrescription = await Prescription.create({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: doctorProfile._id,
      medicines,
      advice: advice || '',
      nextFollowUp: nextFollowUp || undefined,
    });

    const updateFields: any = {};
    if (appointment.status === 'confirmed') updateFields.status = 'completed';
    if (notes) updateFields.notes = notes;

    if (Object.keys(updateFields).length > 0) {
      await Appointment.findByIdAndUpdate(appointmentId, updateFields);
    }

    return Response.json({
      success: true,
      data: newPrescription,
      message: 'Prescription created successfully',
    });
  } catch (error: any) {
    console.error('Create prescription error:', error);
    
    // Handle duplicate key error (one prescription per appointment)
    if (error.code === 11000) {
      return Response.json(
        { success: false, error: 'A prescription already exists for this appointment' },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
