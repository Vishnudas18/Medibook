'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IPrescription, IUser, IDoctorProfile } from '@/types';
import { 
  Pill, 
  Calendar, 
  User, 
  ArrowRight, 
  Download, 
  Clock, 
  FileText,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ClipboardList,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function PatientPrescriptionsPage() {
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['patient-prescriptions'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any[]>>('/api/patient/prescriptions');
      if (!data.success) throw new Error(data.error || 'Failed to fetch prescriptions');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Post-Care Prescriptions</h1>
          <p className="text-slate-500 font-medium italic mt-1">Access and manage medication plans shared by your doctors.</p>
        </div>
        <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Pill className="w-5 h-5 text-amber-600" />
           </div>
           <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Active Plans</p>
              <p className="text-xl font-black text-amber-700">{prescriptions?.length || 0}</p>
           </div>
        </div>
      </div>

      {!prescriptions || prescriptions.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-24 border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 animate-pulse">
            <ClipboardList className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No prescriptions found</h3>
          <p className="text-slate-500 mt-2 max-w-sm font-medium">Digital prescriptions shared after your consultations will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {prescriptions.map((p) => {
            const doctor = p.doctorId as any;
            const doctorUser = doctor?.userId as any;
            
            return (
              <div 
                key={p._id}
                className="group bg-white rounded-[2rem] border border-slate-100 hover:border-primary-200 transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-stretch"
              >
                 <div className="w-full md:w-64 bg-slate-50/50 p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
                    <div className="space-y-4">
                       <Badge className="bg-white text-primary-700 border-primary-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                          Post-Visit Plan
                       </Badge>
                       <div>
                          <p className="text-sm font-bold text-slate-900">Dr. {doctorUser?.name || 'Unknown'}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                             {doctor?.specialization || 'Clinical Specialist'}
                          </p>
                       </div>
                    </div>
                    <div className="pt-8">
                       <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">Issued On</p>
                       <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                          {format(new Date(p.createdAt), 'MMM dd, yyyy')}
                       </p>
                    </div>
                 </div>

                 <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-6 flex-1">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                             <Pill className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900">Recommended Medication</h4>
                             <p className="text-xs text-slate-400 font-medium">{p.medicines?.length || 0} items prescribed in this plan.</p>
                          </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                          {p.medicines?.slice(0, 3).map((m: any, idx: number) => (
                             <Badge key={idx} variant="outline" className="bg-slate-50 border-slate-100 text-slate-600 px-4 py-1.5 rounded-xl font-semibold">
                                {m.name}
                             </Badge>
                          ))}
                          {(p.medicines?.length || 0) > 3 && (
                             <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 px-3 py-1.5 rounded-xl font-bold italic">
                                + {(p.medicines?.length || 0) - 3} more
                             </Badge>
                          )}
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <Dialog>
                          <DialogTrigger asChild>
                             <Button 
                                onClick={() => setSelectedPrescription(p)}
                                className="h-12 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all shadow-lg shadow-primary-500/10 group-hover:scale-105 gap-2"
                             >
                                <FileText className="w-4 h-4" /> View Full Plan
                             </Button>
                          </DialogTrigger>
                           <DialogContent className="max-w-3xl w-[95vw] md:w-full rounded-[2.5rem] md:rounded-[3.5rem] bg-white p-0 border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                              <div className="flex flex-col max-h-[90vh]">
                                 {/* Ultra-Clean Letterhead Header */}
                                 <div className="bg-white px-10 pt-12 pb-8 border-b-2 border-primary-50 relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                                       <div className="flex items-start gap-6">
                                          <div className="w-20 h-20 rounded-[2rem] bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/20 flex-shrink-0">
                                             <Stethoscope className="w-10 h-10 text-white" />
                                          </div>
                                          <div className="space-y-1">
                                             <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                                DR. {doctorUser?.name?.toUpperCase() || 'PRACTITIONER'}
                                             </h2>
                                             <p className="text-primary-600 font-black text-xs uppercase tracking-[0.2em]">
                                                {doctor?.specialization || 'Healthcare Professional'}
                                             </p>
                                             <div className="flex items-center gap-2 pt-1">
                                                {doctor?.qualifications?.map((q: string, i: number) => (
                                                   <span key={i} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                                      {q}
                                                   </span>
                                                ))}
                                             </div>
                                          </div>
                                       </div>
                                       <div className="text-left md:text-right space-y-2">
                                          <div className="space-y-0.5">
                                             <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
                                                {doctor?.clinicName || 'MediBook Digital Clinic'}
                                             </p>
                                             <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed max-w-[220px] md:ml-auto">
                                                {doctor?.address ? `${doctor.address}, ${doctor.city}` : 'Available via Digital Consultation'}
                                             </p>
                                          </div>
                                          <div className="pt-2">
                                             <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-tighter shadow-sm">
                                                Verified Practitioner
                                             </Badge>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Patient Brief & Context */}
                                 <div className="bg-slate-50/50 border-b border-slate-100 px-10 py-6 flex flex-wrap items-center justify-between gap-6">
                                    <div className="grid grid-cols-2 sm:flex items-center gap-10">
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Identity</p>
                                          <p className="font-bold text-slate-900 tracking-tight">{p.patientId?.name || 'Valued Patient'}</p>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consult Date</p>
                                          <p className="font-bold text-slate-900 tracking-tight">{format(new Date(p.createdAt), 'MMM dd, yyyy')}</p>
                                       </div>
                                    </div>
                                    <div className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                                          <ClipboardList className="w-4 h-4 text-primary-600" />
                                       </div>
                                       <div>
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Reference ID</p>
                                          <p className="font-mono text-xs font-black text-slate-700 leading-none">RX-{p._id.substring(18).toUpperCase()}</p>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Formal Rx Content */}
                                 <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar print:overflow-visible">
                                    <div className="relative">
                                       {/* Traditional Rx Symbol */}
                                       <div className="text-8xl font-serif italic text-primary-100/30 select-none absolute -top-10 -left-4 pointer-events-none">Rx</div>
                                       
                                       <div className="space-y-8 relative z-10">
                                          <div className="flex items-center gap-4">
                                             <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-3">
                                                Medication Plan
                                             </h3>
                                             <div className="h-px bg-slate-100 flex-1" />
                                          </div>
                                          
                                          <div className="space-y-4">
                                             {p.medicines?.map((m: any, idx: number) => (
                                                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2rem] border border-slate-100 bg-white hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all group overflow-hidden relative">
                                                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                   <div className="flex items-center gap-6 relative z-10">
                                                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-serif italic font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                                         Rx
                                                      </div>
                                                      <div>
                                                         <p className="text-xl font-black text-slate-900 leading-tight mb-1">{m.name.toUpperCase()}</p>
                                                         <p className="text-xs font-bold text-primary-600 tracking-wider uppercase">{m.dosage} — {m.frequency}</p>
                                                      </div>
                                                   </div>
                                                   <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-10 relative z-10">
                                                      <div className="text-right">
                                                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Duration</p>
                                                         <p className="font-black text-slate-700">{m.duration}</p>
                                                      </div>
                                                      <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-primary-50 transition-colors">
                                                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Instructions</p>
                                                         <p className="text-[11px] font-bold text-slate-600 italic">"{m.instructions || 'As directed'}"</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Doctor's Advice Section */}
                                    {p.advice && (
                                       <div className="space-y-6">
                                          <div className="flex items-center gap-4">
                                             <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-3">
                                                Clinical Advice
                                             </h3>
                                             <div className="h-px bg-slate-100 flex-1" />
                                          </div>
                                          <div className="p-10 rounded-[2.5rem] bg-emerald-50/20 border-2 border-dashed border-emerald-100 relative overflow-hidden group">
                                             <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                                <ClipboardList className="w-32 h-32 text-emerald-900" />
                                             </div>
                                             <p className="text-lg text-slate-700 italic font-medium leading-[1.6] relative z-10">"{p.advice}"</p>
                                          </div>
                                       </div>
                                    )}

                                    {/* Next Step Banner */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between p-8 rounded-[2.5rem] bg-slate-900 text-white gap-8 relative overflow-hidden shadow-2xl">
                                       <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
                                       <div className="flex items-center gap-6 relative z-10">
                                          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                                             <Calendar className="w-7 h-7 text-primary-400" />
                                          </div>
                                          <div>
                                             <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Recommended Follow-up</p>
                                             <p className="font-black text-xl tracking-tight">
                                                {p.nextFollowUp ? format(new Date(p.nextFollowUp), 'EEEE, MMMM dd, yyyy') : 'As and when required'}
                                             </p>
                                          </div>
                                       </div>
                                       <Button className="h-14 px-10 rounded-2xl bg-primary-600 text-white hover:bg-primary-700 font-black shadow-xl shadow-primary-900/20 transition-all active:scale-95 text-xs uppercase tracking-[0.2em] relative z-10 border-none group">
                                          Update Schedule <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                       </Button>
                                    </div>
                                 </div>

                                 {/* Formal Footer - Clinical Validation */}
                                 <div className="px-12 py-10 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                       <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-100 p-2 shadow-sm flex items-center justify-center">
                                          <div className="grid grid-cols-2 gap-1.5 opacity-20">
                                             <div className="w-5 h-5 bg-slate-900 rounded-sm" />
                                             <div className="w-5 h-5 bg-slate-900 rounded-sm" />
                                             <div className="w-5 h-5 bg-slate-900 rounded-sm" />
                                             <div className="w-5 h-5 bg-slate-900 rounded-sm" />
                                          </div>
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Digitally Authenticated by</p>
                                          <div className="flex items-center gap-2">
                                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                             <p className="font-black text-slate-900 tracking-tighter">MEDIBOOK SECURE NETWORK</p>
                                          </div>
                                          <p className="text-[9px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">AUTH-ID: {p._id.toUpperCase()}</p>
                                       </div>
                                    </div>
                                    
                                    <div className="text-center md:text-right">
                                       <div className="mb-3 italic font-serif text-3xl text-slate-300 select-none opacity-40">
                                          Dr. {doctorUser?.name || 'Practitioner'}
                                       </div>
                                       <div className="h-px w-48 bg-slate-200 ml-auto mb-3" />
                                       <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">AUTHORised SIGNATORY</p>
                                    </div>
                                 </div>
                              </div>
                              
                              {/* Print / Export UI */}
                              <div className="absolute top-10 right-10 flex items-center gap-4 z-20 print:hidden">
                                 <Button 
                                    onClick={() => window.print()}
                                    size="icon"
                                    className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                                 >
                                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                 </Button>
                                 <Button 
                                    onClick={() => setSelectedPrescription(null)}
                                    size="icon"
                                    variant="ghost"
                                    className="w-12 h-12 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all"
                                 >
                                    <MoreVertical className="w-6 h-6" />
                                 </Button>
                              </div>
                           </DialogContent>
                       </Dialog>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
               <ArrowRight className="w-8 h-8 text-white rotate-45" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white tracking-tight">Need a refill?</h3>
               <p className="text-slate-400 font-medium">Book a follow-up appointment with your doctor to renew your medications.</p>
            </div>
         </div>
         <Button className="relative z-10 min-w-[200px] h-14 rounded-2xl bg-primary-600 text-white hover:bg-primary-700 font-black shadow-xl border-none">
            Schedule Follow-Up
         </Button>
      </div>
    </div>
  );
}
