import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import Payment from '@/models/Payment';
import DoctorProfile from '@/models/DoctorProfile';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
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
    const doctorProfile = await DoctorProfile.findOne({ userId: user.userId }).lean() as any;
    if (!doctorProfile) {
      return Response.json(
        { success: false, error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const doctorId = doctorProfile._id;
    const now = new Date();
    const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date(now).setHours(23, 59, 59, 999));

    // 1. Today's Patients Count
    const todayPatientsCount = await Appointment.countDocuments({
      doctorId,
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ['confirmed', 'completed'] }
    });

    // 2. This Week's Appointments Count (Next 7 days including today)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const weekAppointmentsCount = await Appointment.countDocuments({
      doctorId,
      date: { $gte: startOfToday, $lte: sevenDaysFromNow },
      status: { $in: ['confirmed', 'completed'] }
    });

    // 3. Monthly Revenue (Current Month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueData = await Payment.aggregate([
      {
        $match: {
          doctorId,
          status: 'paid',
          paidAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // 4. Today's Detailed Appointments
    const todayAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ['confirmed', 'completed'] }
    })
    .sort({ startTime: 1 })
    .populate('patientId', 'name email image')
    .lean();

    return Response.json({
      success: true,
      data: {
        stats: {
          todayPatients: todayPatientsCount,
          weekPatients: weekAppointmentsCount,
          monthlyRevenue,
          avgRating: doctorProfile.rating || 0
        },
        todayAppointments
      }
    });

  } catch (error: any) {
    console.error('Fetch doctor stats error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
