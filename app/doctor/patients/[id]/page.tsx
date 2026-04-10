'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Stethoscope, 
  ClipboardList, 
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ClinicalPulse from '@/components/doctor/ClinicalPulse';

export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patient-history', patientId],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any>>(`/api/doctor/patients/${patientId}/history`);
      if (!data.success) throw new Error(data.error || 'Failed to fetch patient history');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <Skeleton className="h-10 w-32 rounded-xl mb-4" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="space-y-6 mt-10">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.patient) {
    return (
      <div className="space-y-8 pb-20">
         <Button onClick={() => router.back()} variant="ghost" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </Button>
        <div className="p-12 bg-red-50 text-red-700 rounded-[2rem] border border-red-100 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-16 h-16 mb-6 opacity-30" />
          <h3 className="font-bold text-2xl mb-2">Access Denied</h3>
          <p className="opacity-80 max-w-md">You do not have access to this patient's history, or the patient does not exist.</p>
        </div>
      </div>
    );
  }

  const { patient, history } = data;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-6">
          <Button onClick={() => router.back()} variant="ghost" className="gap-2 -ml-4 hover:bg-slate-100 rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Back to List
          </Button>
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 rounded-full bg-primary-600 shadow-lg flex items-center justify-center border-4 border-white">
                <span className="text-3xl font-black text-white">{patient.name[0]}</span>
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                   <User className="w-4 h-4" /> Patient Profile
                </p>
             </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hidden sm:flex">
           <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
              <Calendar className="w-6 h-6" />
           </div>
           <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Visits</p>
              <p className="text-xl font-black text-slate-900">{history.length}</p>
           </div>
        </div>
      </div>

      {/* Innovation: Section 2 - Clinical Pulse */}
      <div>
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] pl-1 mb-6">Proactive Clinical Insights</h3>
         <ClinicalPulse history={history} patient={patient} />
      </div>

      <div className="space-y-8 pt-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
           <ClipboardList className="w-6 h-6 text-primary-600" />
           Consultation Timeline
        </h3>

        {history.length === 0 ? (
           <div className="p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                 <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">No Past Visits</h4>
              <p className="text-slate-500 max-w-md">There are no completed consultations recorded for this patient yet.</p>
           </div>
        ) : (
          <div className="relative pl-6 md:pl-10 border-l-2 border-slate-100 space-y-12">
            {history.map((visit: any, idx: number) => {
              const isCompleted = visit.status === 'completed';
              return (
                <div key={visit._id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute -left-[31px] md:-left-[47px] top-4 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-125",
                    isCompleted ? "bg-emerald-500" : "bg-amber-400"
                  )} />

                  <Card className="rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 bg-white group-hover:border-primary-100 overflow-hidden">
                     {/* Header */}
                     <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 pb-6 border-b border-slate-50">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-slate-400" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Visit</p>
                              <p className="font-bold text-slate-900">{format(new Date(visit.date), 'MMMM do, yyyy')} • {visit.startTime}</p>
                           </div>
                        </div>
                        <div>
                           <Badge className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider", isCompleted ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-amber-50 text-amber-700 hover:bg-amber-100")}>
                             {visit.status}
                           </Badge>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Clinical Notes & Details */}
                        <div className="space-y-6">
                           <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2">
                                 <AlertCircle className="w-3.5 h-3.5" /> Reason for Visit
                              </h4>
                              <p className="text-slate-700 font-medium">{visit.reason}</p>
                           </div>

                           {visit.notes && (
                              <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100/50">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-2 mb-3">
                                    <Stethoscope className="w-3.5 h-3.5" /> Clinical Notes
                                 </h4>
                                 <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{visit.notes}</p>
                              </div>
                           )}
                        </div>

                        {/* Prescription Details */}
                        {visit.prescription ? (
                          <div className="bg-primary-50/30 p-6 rounded-3xl border border-primary-100/50">
                             <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-600 flex items-center gap-2">
                                   <Pill className="w-3.5 h-3.5" /> Prescribed Medications
                                </h4>
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                             </div>
                             
                             <div className="space-y-3">
                                {visit.prescription.medicines.map((med: any, i: number) => (
                                   <div key={i} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                      <div>
                                         <p className="font-bold text-slate-900">{med.name}</p>
                                         <p className="text-xs text-slate-500 font-medium">Qty: {med.duration} • {med.dosage}</p>
                                      </div>
                                      <Badge variant="outline" className="text-[10px] font-black max-w-[80px] text-center border-slate-200">
                                         {med.frequency}
                                      </Badge>
                                   </div>
                                ))}
                             </div>

                             {visit.prescription.advice && (
                                <div className="mt-6 pt-6 border-t border-primary-100/50">
                                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Doctor's Advice</h4>
                                   <p className="text-slate-600 text-sm italic">"{visit.prescription.advice}"</p>
                                </div>
                             )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center h-full min-h-[200px]">
                             <FileIcon className="w-8 h-8 text-slate-300 mb-3" />
                             <p className="font-bold text-slate-400 text-sm">No Digital Prescription</p>
                          </div>
                        )}
                     </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FileIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
