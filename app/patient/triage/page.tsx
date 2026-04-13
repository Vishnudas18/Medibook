'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ApiResponse,
  ISymptomAssessment,
  ITriageDoctorRecommendation,
  TriageUrgency,
} from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Sparkles, Activity, ArrowRight } from 'lucide-react';

const SYMPTOM_LIBRARY = [
  'Fever',
  'Cough',
  'Cold',
  'Headache',
  'Migraine',
  'Chest pain',
  'Shortness of breath',
  'Back pain',
  'Joint pain',
  'Rash',
  'Itching',
  'Dizziness',
  'Fatigue',
];

function urgencyStyles(level: TriageUrgency) {
  if (level === 'high') return 'bg-red-50 text-red-700 border-red-100';
  if (level === 'medium') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-emerald-50 text-emerald-700 border-emerald-100';
}

export default function PatientTriagePage() {
  const { fetchWithAuth } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState(2);
  const [severity, setSeverity] = useState(4);
  const [preferredCity, setPreferredCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [notes, setNotes] = useState('');
  const [assessment, setAssessment] = useState<ISymptomAssessment | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          durationDays,
          severity,
          preferredCity: preferredCity || undefined,
          preferredLanguage: preferredLanguage || undefined,
          notes: notes || undefined,
        }),
      });
      const data = (await response.json()) as ApiResponse<ISymptomAssessment>;

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Could not complete triage');
      }

      return data.data;
    },
    onSuccess: (result) => setAssessment(result),
  });

  const recommendationsQuery = useQuery({
    queryKey: ['triage-recommendations', assessment?._id],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `/api/triage/recommendations?assessmentId=${assessment?._id}`
      );
      const data = (await response.json()) as ApiResponse<ITriageDoctorRecommendation[]>;
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Could not load recommendations');
      }
      return data.data;
    },
    enabled: Boolean(assessment?._id),
  });

  const canSubmit = useMemo(
    () => (selectedSymptoms.length > 0 || notes.trim().length > 0) && !analyzeMutation.isPending,
    [selectedSymptoms.length, notes, analyzeMutation.isPending]
  );
  const shouldSuggestDoctor = assessment ? assessment.urgencyLevel !== 'low' : false;

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]
    );
  };

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary-600" />
          AI Symptom Triage
        </h1>
        <p className="text-slate-500 max-w-3xl">
          Share your symptoms and get a quick care direction with a smart doctor match score.
        </p>
      </section>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl">Tell us how you feel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Select symptoms</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_LIBRARY.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${
                    selectedSymptoms.includes(symptom)
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Duration (days)</label>
              <Input
                type="number"
                min={0}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Severity (1-10)</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Preferred city (optional)</label>
              <Input value={preferredCity} onChange={(e) => setPreferredCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Preferred language (optional)</label>
              <Input value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Additional notes (optional)</label>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type disease/condition details (e.g. thyroid, asthma, skin allergy) for smarter triage."
            />
          </div>

          <Button onClick={() => analyzeMutation.mutate()} disabled={!canSubmit}>
            {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Symptoms'}
          </Button>
          {analyzeMutation.isError && (
            <p className="text-sm text-red-600">
              {(analyzeMutation.error as Error).message || 'Triage failed. Please retry.'}
            </p>
          )}
        </CardContent>
      </Card>

      {assessment && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              Triage Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary-50 text-primary-700 border border-primary-100">
                Recommended: {assessment.recommendedSpecialization}
              </Badge>
              <Badge className={`border ${urgencyStyles(assessment.urgencyLevel)}`}>
                Urgency: {assessment.urgencyLevel.toUpperCase()}
              </Badge>
            </div>
            {assessment.urgencyLevel === 'medium' && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Medium urgency detected. It is recommended to consult a doctor soon.
              </p>
            )}
            <p className="text-sm text-slate-600 leading-relaxed">{assessment.aiSummary}</p>
            <p className="text-xs text-slate-500">
              This triage is supportive guidance and not a confirmed diagnosis.
            </p>
          </CardContent>
        </Card>
      )}

      {assessment && shouldSuggestDoctor && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-slate-900">Smart Doctor Matches</h2>
          </div>

          {recommendationsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-44 w-full rounded-2xl" />
            </div>
          ) : recommendationsQuery.data && recommendationsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendationsQuery.data.map((item) => (
                <Card key={item.doctorId} className="border-slate-200">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900">Dr. {item.doctor.userId.name}</h3>
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Match {Math.round(item.score)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {item.doctor.specialization} - {item.doctor.city}
                    </p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      {item.reasons.slice(0, 3).map((reason) => (
                        <li key={reason}>- {reason}</li>
                      ))}
                    </ul>
                    <Link
                      href={`/patient/doctors/${item.doctorId}`}
                      className="inline-flex items-center text-primary-700 text-sm font-semibold hover:underline"
                    >
                      View Profile <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No matching doctors found yet. Try another symptom set.</p>
          )}
        </section>
      )}

      {assessment && !shouldSuggestDoctor && (
        <p className="text-sm text-slate-500">
          Current urgency is low. Monitor symptoms, and consult a doctor if they worsen.
        </p>
      )}
    </div>
  );
}
