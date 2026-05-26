'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import {
  Pill,
  Calendar,
  ArrowRight,
  Download,
  FileText,
  ClipboardList,
  Stethoscope,
  CheckCircle2,
  X,
  Clock,
  MapPin,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function PatientPrescriptionsPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any[]>>('/api/patient/prescriptions');
      if (!data.success) throw new Error(data.error || 'Failed to fetch prescriptions');
      return data.data;
    },
  });

  const openDetail = (p: any) => {
    setSelected(p);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Prescriptions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Digital medication plans issued after your consultations.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Pill className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Active Plans</p>
            <p className="text-lg font-bold leading-none text-amber-700">{prescriptions?.length ?? 0}</p>
          </div>
        </div>
      </div>

      {/* ── Prescription List ────────────────────────────────────── */}
      {!prescriptions || prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <ClipboardList className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-base font-semibold text-slate-700">No prescriptions found</p>
          <p className="mt-1 text-sm text-slate-400">Prescriptions shared after consultations will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((p) => {
            const doctor    = p.doctorId as any;
            const doctorUser = doctor?.userId as any;
            return (
              <div
                key={p._id}
                className="group flex flex-col sm:flex-row items-stretch gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-primary-300 hover:shadow-md"
              >
                {/* Left accent */}
                <div className="flex w-full flex-row items-center gap-4 border-b sm:w-56 sm:flex-col sm:items-start sm:justify-between sm:border-b-0 sm:border-r border-slate-100 bg-slate-50 px-5 py-4 sm:p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Doctor</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">Dr. {doctorUser?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{doctor?.specialization || 'Specialist'}</p>
                  </div>
                  <div className="sm:mt-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Issued</p>
                    <p className="text-xs font-medium text-slate-600">
                      {format(new Date(p.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Right content */}
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50">
                        <Pill className="h-3.5 w-3.5 text-primary-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {p.medicines?.length || 0} medication{p.medicines?.length !== 1 ? 's' : ''} prescribed
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.medicines?.slice(0, 3).map((m: any, i: number) => (
                        <span key={i} className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {m.name}
                        </span>
                      ))}
                      {(p.medicines?.length ?? 0) > 3 && (
                        <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                          +{p.medicines.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => openDetail(p)}
                    className="h-9 shrink-0 gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm"
                  >
                    <FileText className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Prescription Detail Dialog ───────────────────────────── */}
      {selected && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            aria-describedby={undefined}
            showCloseButton={false}
            className="flex max-h-[90vh] w-[95vw] max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
          >
            <span className="sr-only"><DialogTitle>Prescription Detail</DialogTitle></span>

            {/* ── Modal Header ── */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 shadow-md shadow-primary-600/20">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">
                    Dr. {(selected.doctorId as any)?.userId?.name || '—'}
                  </p>
                  <p className="text-xs text-slate-500">{(selected.doctorId as any)?.specialization}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(selected.doctorId as any)?.qualifications?.map((q: string, i: number) => (
                      <span key={i} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{q}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-8 gap-1.5 rounded-lg border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Meta row ── */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-slate-100 bg-slate-50/50 px-6 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Patient</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-700">
                  {selected.patientId?.name || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Issued On</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-700">
                  {format(new Date(selected.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              {selected.nextFollowUp && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Follow-up</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-700">
                    {format(new Date(selected.nextFollowUp), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              <div className="ml-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ref ID</p>
                <p className="mt-0.5 font-mono text-xs font-semibold text-primary-600">
                  RX-{selected._id?.substring(18)?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Medication Plan */}
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Medication Plan</p>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="space-y-2">
                  {selected.medicines?.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-primary-200 hover:bg-primary-50/20"
                    >
                      {/* Top row: icon + name + dosage */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 font-serif italic text-sm font-bold text-primary-600">
                          Rx
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.dosage} · {m.frequency}</p>
                        </div>
                      </div>
                      {/* Bottom row: duration + instructions */}
                      <div className="mt-3 flex flex-wrap gap-3 pl-12">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration</p>
                          <p className="text-sm font-semibold text-slate-700">{m.duration}</p>
                        </div>
                        {m.instructions && (
                          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Instructions</p>
                            <p className="text-xs italic text-slate-600">{m.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Advice */}
              {selected.advice && (
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Clinical Advice</p>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <p className="text-sm italic leading-relaxed text-slate-700">"{selected.advice}"</p>
                  </div>
                </div>
              )}

              {/* Follow-up banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-slate-200 bg-slate-900 px-5 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Calendar className="h-4 w-4 text-primary-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">Recommended Follow-up</p>
                  <p className="text-sm font-semibold text-white">
                    {selected.nextFollowUp
                      ? format(new Date(selected.nextFollowUp), 'EEEE, MMMM d, yyyy')
                      : 'As and when required'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Modal Footer ── */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-500">Digitally authenticated by MediBook</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 rounded-lg px-4 text-xs font-medium text-slate-500 hover:bg-slate-200"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Bottom CTA ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-slate-900 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
            <ArrowRight className="h-5 w-5 rotate-45 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Need a refill?</p>
            <p className="text-sm text-slate-400">Book a follow-up to renew your medications.</p>
          </div>
        </div>
        <Button className="shrink-0 h-10 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 border-none shadow-lg">
          Schedule Follow-Up
        </Button>
      </div>
    </div>
  );
}
