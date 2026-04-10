import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import Prescription from '@/models/Prescription';
import User from '@/models/User';
import DoctorProfile from '@/models/DoctorProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    if (!user || user.role !== 'doctor') {
      return Response.json(
        { success: false, error: 'Unauthorized — Doctor access only' },
        { status: 401 }
      );
    }

    await connectDB();

    const doctorProfile = await DoctorProfile.findOne({ userId: user.userId }).lean();
    if (!doctorProfile) {
      return Response.json(
        { success: false, error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const patientId = id;

    // Verify patient has booked with this doctor before
    const hasBooked = await Appointment.exists({ doctorId: doctorProfile._id, patientId });
    if (!hasBooked) {
      return Response.json(
        { success: false, error: 'Unauthorized — Patient history restricted to assigned doctor' },
        { status: 403 }
      );
    }

    const patientInfo = await User.findById(patientId).select('-password').lean();

    const appointments = await Appointment.find({ patientId, doctorId: doctorProfile._id })
      .sort({ date: -1, startTime: -1 })
      .lean();

    const prescriptions = await Prescription.find({ patientId, doctorId: doctorProfile._id })
      .sort({ createdAt: -1 })
      .lean();

    // Map prescriptions to appointments
    const history = appointments.map(appt => {
      const rx = prescriptions.find(p => p.appointmentId.toString() === appt._id.toString());
      return {
        ...appt,
        prescription: rx || null
      };
    });

    return Response.json({
      success: true,
      data: {
        patient: patientInfo,
        history,
      },
    });
  } catch (error) {
    console.error('Fetch patient history error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
