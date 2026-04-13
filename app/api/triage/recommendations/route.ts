import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import SymptomAssessment from '@/models/SymptomAssessment';
import DoctorProfile from '@/models/DoctorProfile';
import type { IDoctorProfileWithUser, ITriageDoctorRecommendation } from '@/types';

type AssessmentLean = {
  recommendedSpecialization: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  preferredCity?: string;
  preferredLanguage?: string;
};

function scoreDoctor(assessment: AssessmentLean, doctor: IDoctorProfileWithUser) {
  let score = 0;
  const reasons: string[] = [];

  if (doctor.specialization.toLowerCase() === assessment.recommendedSpecialization.toLowerCase()) {
    score += 50;
    reasons.push('Matches recommended specialization');
  }

  const ratingScore = Math.min(doctor.rating || 0, 5) * 5;
  score += ratingScore;
  if ((doctor.rating || 0) >= 4) reasons.push('High patient rating');

  if ((doctor.totalRatings || 0) >= 20) {
    score += 8;
    reasons.push('Strong review confidence');
  }

  if (
    assessment.preferredCity &&
    doctor.city &&
    doctor.city.toLowerCase() === assessment.preferredCity.toLowerCase()
  ) {
    score += 15;
    reasons.push('Available in preferred city');
  }

  if (
    assessment.preferredLanguage &&
    doctor.languages?.some(
      (lang) => lang.toLowerCase() === (assessment.preferredLanguage || '').toLowerCase()
    )
  ) {
    score += 10;
    reasons.push('Supports preferred language');
  }

  if ((doctor.consultationFee || 0) <= 1000) {
    score += 5;
    reasons.push('Affordable consultation fee');
  }

  return { score, reasons };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUser(request);
    requireRole(authUser, 'patient');

    const assessmentId = request.nextUrl.searchParams.get('assessmentId');
    if (!assessmentId) {
      return Response.json({ success: false, error: 'assessmentId is required' }, { status: 400 });
    }

    const assessment = await SymptomAssessment.findOne({
      _id: assessmentId,
      patientId: authUser.userId,
    }).lean();

    if (!assessment) {
      return Response.json({ success: false, error: 'Assessment not found' }, { status: 404 });
    }

    let doctors = await DoctorProfile.find({
      status: 'approved',
      specialization: assessment.recommendedSpecialization,
    })
      .populate('userId', 'name email phone avatar')
      .sort({ rating: -1, totalRatings: -1 })
      .limit(20)
      .lean<IDoctorProfileWithUser[]>();

    // For medium/high urgency, always provide doctor suggestions
    if (doctors.length === 0 && assessment.urgencyLevel !== 'low') {
      doctors = await DoctorProfile.find({ status: 'approved' })
        .populate('userId', 'name email phone avatar')
        .sort({ rating: -1, totalRatings: -1 })
        .limit(20)
        .lean<IDoctorProfileWithUser[]>();
    }

    const recommendations: ITriageDoctorRecommendation[] = doctors
      .map((doctor) => {
        const { score, reasons } = scoreDoctor(assessment, doctor);
        return {
          doctorId: String(doctor._id),
          score,
          reasons,
          doctor,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return Response.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Triage recommendations error:', error);
    if (error instanceof Error && error.message.toLowerCase().includes('token')) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
