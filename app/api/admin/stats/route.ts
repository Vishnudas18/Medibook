import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import DoctorProfile from '@/models/DoctorProfile';
import Appointment from '@/models/Appointment';
import Payment from '@/models/Payment';
import { getAuthUser, requireRole } from '@/lib/auth';

/**
 * GET — Fetch platform-wide statistics for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    requireRole(user, 'admin');

    await connectDB();

    const [
      totalPatients,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      totalRevenueData,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      DoctorProfile.countDocuments({ status: 'approved' }),
      DoctorProfile.countDocuments({ status: 'pending' }),
      Appointment.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = totalRevenueData[0]?.total / 100 || 0; // Convert paise to INR

    // Fetch daily booking stats for chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return Response.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        totalRevenue,
        dailyStats: dailyStats.map(s => ({ date: s._id, count: s.count })),
      },
    });
  } catch (error: any) {
    console.error('Fetch admin stats error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
