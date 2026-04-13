import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import SymptomAssessment from '@/models/SymptomAssessment';
import { triageAnalyzeSchema } from '@/schemas/triage.schema';
import { buildTriageSummary, inferSpecialization, inferUrgency } from '@/lib/triage';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUser(request);
    requireRole(authUser, 'patient');

    const body = await request.json();
    const parsed = triageAnalyzeSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid request body' },
        { status: 400 }
      );
    }

    const { symptoms, durationDays, severity, notes, preferredCity, preferredLanguage } = parsed.data;
    const recommendedSpecialization = inferSpecialization(symptoms, notes);
    const urgencyLevel = inferUrgency(durationDays, severity, symptoms, notes);
    const aiSummary = buildTriageSummary(
      symptoms,
      durationDays,
      severity,
      recommendedSpecialization,
      urgencyLevel,
      notes
    );

    const assessment = await SymptomAssessment.create({
      patientId: authUser.userId,
      symptoms,
      durationDays,
      severity,
      notes,
      preferredCity,
      preferredLanguage,
      recommendedSpecialization,
      urgencyLevel,
      aiSummary,
    });

    return Response.json(
      {
        success: true,
        data: assessment,
        message: 'Triage completed successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Triage analyze error:', error);
    if (error instanceof Error && error.message.toLowerCase().includes('token')) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
