import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'patient') {
      return Response.json(
        { success: false, error: 'Unauthorized — Patient access only' },
        { status: 401 }
      );
    }

    await connectDB();

    const patientId = user.userId;
    const now = new Date();
    const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0));

    // 1. Next Appointment (Closest upcoming confirmed or pending)
    const nextAppointment = await Appointment.findOne({
      patientId,
      date: { $gte: startOfToday },
      status: { $in: ['confirmed', 'pending'] }
    })
    .sort({ date: 1, startTime: 1 })
    .populate('doctorId', 'userId name specialization')
    .lean();

    // 2. This Month's Appointments Count
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthAppointmentsCount = await Appointment.countDocuments({
      patientId,
      date: { $gte: startOfMonth },
      status: { $ne: 'cancelled' }
    });

    // 3. Total Completed Consultations
    const totalConsultations = await Appointment.countDocuments({
      patientId,
      status: 'completed'
    });

    return Response.json({
      success: true,
      data: {
        nextAppointment,
        stats: {
          monthAppointments: monthAppointmentsCount,
          totalConsultations,
          // You could add more metrics here like 'prescriptionsPending' etc.
        }
      }
    });

  } catch (error: any) {
    console.error('Fetch patient stats error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
