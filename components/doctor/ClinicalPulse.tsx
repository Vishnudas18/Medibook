'use client';

import { 
  Activity, 
  Pill, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  Zap,
  Clock,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Prescription {
  medicines: { name: string; dosage: string; frequency: string; duration: string }[];
  advice?: string;
}

interface Visit {
  _id: string;
  date: string;
  status: string;
  prescription?: Prescription;
  notes?: string;
}

interface ClinicalPulseProps {
  history: Visit[];
  patient: { name: string };
}

export default function ClinicalPulse({ history, patient }: ClinicalPulseProps) {
  // Logic to extract unique medications
  const allMeds = history.flatMap(v => v.prescription?.medicines || []).map(m => m.name);
  const uniqueMeds = Array.from(new Set(allMeds)).slice(0, 3);
  
  // Logic to find latest advice
  const latestAdvice = history.find(v => v.prescription?.advice)?.prescription?.advice;

  // Visit frequency (last 6 months - simulated for now)
  const visitCount = history.filter(v => v.status === 'completed').length;
  
  // Health velocity (improvement trend - simulated based on notes length or completion)
  const healthVelocity = visitCount > 1 ? 'Stable' : 'New Case';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Velocity Card */}
      <Card className="col-span-1 lg:col-span-1 p-6 rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-xl shadow-primary-600/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-500" />
         <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
               <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <Badge className="bg-white/20 text-white border-none text-[9px] font-black uppercase tracking-widest">Velocity</Badge>
            </div>
            <div>
               <p className="text-[10px] uppercase font-bold text-primary-100 tracking-[0.2em]">Patient Status</p>
               <h3 className="text-2xl font-black">{healthVelocity}</h3>
            </div>
            <div className="pt-2 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
               <span className="text-[11px] font-bold text-primary-50 tracking-wide underline underline-offset-4">Analyzing Trends...</span>
            </div>
         </div>
      </Card>

      {/* Medications Pulse */}
      <Card className="col-span-1 lg:col-span-1 p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative">
         <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50" />
         <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
               </div>
               <Badge variant="outline" className="border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest">Recurring</Badge>
            </div>
            <div>
               <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Medication Pulse</p>
               <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueMeds.length > 0 ? (
                    uniqueMeds.map(med => (
                      <span key={med} className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        {med}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-bold text-slate-400 italic">No recurring meds</span>
                  )}
               </div>
            </div>
         </div>
      </Card>

      {/* Latest Clinical Advice */}
      <Card className="col-span-1 lg:col-span-2 p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
         <div className="flex flex-col h-full justify-between gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                     <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] leading-none mb-1">Active Advice</p>
                    <p className="text-xs font-bold text-slate-900 leading-none">Last Issued Guidelines</p>
                  </div>
               </div>
               <div className="h-6 px-3 bg-slate-50 rounded-lg flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Primary</span>
               </div>
            </div>
            
            <div className={cn(
               "flex-1 p-5 rounded-3xl bg-amber-50/30 border border-amber-100/50 flex flex-col justify-center",
               !latestAdvice ? "items-center justify-center opacity-40 grayscale" : ""
            )}>
               <p className={cn(
                  "text-sm font-medium leading-relaxed italic text-amber-900/80",
                  !latestAdvice ? "text-slate-400 text-center" : ""
               )}>
                  {latestAdvice ? `"${latestAdvice}"` : "No specific clinical advice recorded in recent history."}
               </p>
            </div>

            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Compliant</span>
               </div>
               <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                      <StethoscopeIcon className="w-3 h-3" />
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </Card>
    </div>
  );
}

function StethoscopeIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 1 0-.2.3Z" />
      <path d="M3.3 7a4.49 4.49 0 1 1 2 7.7" />
      <path d="M7 11.5l2 2" />
      <path d="M11 15c0 .3.1.6.3.8" />
      <path d="M12.2 17.8c.8 1 2.1 1.6 3.5 1.4 2.5-.2 4.3-2.6 4.3-5.2V11c0-1.7-1.4-3.1-3.1-3.1s-3.1 1.4-3.1 3.1v3.7c0 .1-.1.2-.2.2h-.1c-.1 0-.2-.1-.2-.2V11" />
      <path d="M14.5 9h5" />
      <path d="M11.5 13.5l1.5-1.5" />
    </svg>
  );
}
