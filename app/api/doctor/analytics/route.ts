import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/models/Appointment';
import Payment from '@/models/Payment';
import DoctorProfile from '@/models/DoctorProfile';
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

    const doctorProfile = await DoctorProfile.findOne({ userId: user.userId }).lean();
    if (!doctorProfile) {
      return Response.json(
        { success: false, error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctorId: doctorProfile._id }).lean();
    
    // Get all payments for this doctor
    const payments = await Payment.find({ doctorId: doctorProfile._id }).lean();

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
    
    const totalRevenue = payments.reduce((acc, curr) => curr.status === 'paid' ? acc + curr.amount : acc, 0);

    // Group revenue and completed appointments by month for chart
    const monthlyStats: Record<string, { revenue: number, completed: number }> = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyStats[d.toLocaleString('default', { month: 'short' })] = { revenue: 0, completed: 0 };
    }

    payments.forEach(payment => {
      if (payment.status === 'paid' && payment.createdAt) {
        const month = new Date(payment.createdAt).toLocaleString('default', { month: 'short' });
        if (monthlyStats[month]) {
          monthlyStats[month].revenue += payment.amount;
        }
      }
    });

    appointments.forEach(appointment => {
      if (appointment.status === 'completed' && appointment.createdAt) {
         const month = new Date(appointment.createdAt).toLocaleString('default', { month: 'short' });
         if (monthlyStats[month]) {
           monthlyStats[month].completed += 1;
         }
      }
    });

    const chartData = Object.entries(monthlyStats).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      completed: data.completed,
    }));

    return Response.json({
      success: true,
      data: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
        chartData
      },
    });
  } catch (error) {
    console.error('Fetch doctor analytics error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
