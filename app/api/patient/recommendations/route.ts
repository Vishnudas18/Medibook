import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import Appointment from '@/models/Appointment';
import DoctorProfile from '@/models/DoctorProfile';
import Availability from '@/models/Availability';
import { ISmartDoctorRecommendation, IDoctorProfileWithUser } from '@/types';

type AppointmentLean = {
  doctorId: {
    _id: string;
    specialization: string;
  } | null;
};

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
    const appointmentHistory = await Appointment.find({
      patientId,
      status: { $in: ['pending', 'confirmed', 'completed'] },
    })
      .populate('doctorId', 'specialization')
      .select('doctorId')
      .lean<AppointmentLean[]>();

    const specializationCount = new Map<string, number>();
    const doctorBookingCount = new Map<string, number>();

    for (const item of appointmentHistory) {
      if (!item.doctorId) continue;
      const doctorId = String(item.doctorId._id);
      const specialization = item.doctorId.specialization || 'General';

      doctorBookingCount.set(doctorId, (doctorBookingCount.get(doctorId) || 0) + 1);
      specializationCount.set(
        specialization,
        (specializationCount.get(specialization) || 0) + 1
      );
    }

    const topSpecializations = [...specializationCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const doctorFilter =
      topSpecializations.length > 0
        ? { status: 'approved', specialization: { $in: topSpecializations } }
        : { status: 'approved' };

    const candidateDoctors = await DoctorProfile.find(doctorFilter)
      .populate('userId', 'name email phone avatar')
      .sort({ rating: -1, totalRatings: -1 })
      .limit(30)
      .lean<IDoctorProfileWithUser[]>();

    const dayOfWeek = new Date().getDay();
    const candidateDoctorIds = candidateDoctors.map((doc) => doc._id);
    const activeToday = await Availability.find({
      doctorId: { $in: candidateDoctorIds },
      dayOfWeek,
      isActive: true,
    })
      .select('doctorId')
      .lean<{ doctorId: string }[]>();

    const availableTodaySet = new Set(activeToday.map((row) => String(row.doctorId)));

    const recommendations: ISmartDoctorRecommendation[] = candidateDoctors
      .map((doctor) => {
        let score = 0;
        const reasons: string[] = [];
        const doctorId = String(doctor._id);
        const pastBookings = doctorBookingCount.get(doctorId) || 0;
        const specializationRank = topSpecializations.indexOf(doctor.specialization);
        const availableToday = availableTodaySet.has(doctorId);

        if (specializationRank >= 0) {
          score += 30 - specializationRank * 5;
          reasons.push('Matches your frequently booked specialization');
        }

        if (pastBookings > 0) {
          score += Math.min(pastBookings * 12, 30);
          reasons.push(`You have booked this doctor ${pastBookings} time(s) before`);
        }

        if (availableToday) {
          score += 20;
          reasons.push('Has active slots today');
        }

        const ratingScore = Math.min(doctor.rating || 0, 5) * 6;
        score += ratingScore;
        if ((doctor.rating || 0) >= 4) reasons.push('Highly rated by patients');

        if ((doctor.totalRatings || 0) >= 20) {
          score += 10;
          reasons.push('Strong review confidence');
        }

        if ((doctor.consultationFee || 0) <= 1000) {
          score += 5;
          reasons.push('Budget-friendly fee');
        }

        return {
          doctorId,
          score,
          reasons: reasons.slice(0, 3),
          availableToday,
          pastBookings,
          doctor,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return Response.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Patient recommendation error:', error);
    if (error instanceof Error && error.message.toLowerCase().includes('token')) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
