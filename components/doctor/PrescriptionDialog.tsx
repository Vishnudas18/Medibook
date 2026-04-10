'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import { 
  Plus, 
  Trash2, 
  Pill, 
  ClipboardList, 
  Calendar, 
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Clock,
  CheckCircle2,
  ArrowRight,
  Circle,
  Activity,
  User,
  HeartPulse,
  Printer,
  FileText,
  X,
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MedicineInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  patientName: string;
}

export default function PrescriptionDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  patientName,
}: PrescriptionDialogProps) {
  const queryClient = useQueryClient();
  const [medicines, setMedicines] = useState<MedicineInput[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [advice, setAdvice] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: res } = await axios.post<ApiResponse<any>>('/api/doctor/prescriptions', data);
      if (!res.success) throw new Error(res.error || 'Failed to create prescription');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-stats'] });
      toast.success('Prescription issued successfully');
      onOpenChange(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setAdvice('');
    setNextFollowUp('');
    setNotes('');
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof MedicineInput, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (medicines.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      toast.error('Please fill in all required medication fields');
      return;
    }
    mutation.mutate({
      appointmentId,
      medicines,
      advice,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
      notes,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-7xl w-[98vw] rounded-[2rem] bg-white p-0 border-none shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-[90vh] lg:h-[85vh]">
          {/* Clinical Header */}
          <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
             {/* Abstract background elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

             <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                   <Stethoscope className="w-7 h-7 text-primary-400" />
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-3">
                      <DialogTitle className="text-2xl font-black text-white tracking-tight">Clinical Prescription</DialogTitle>
                      <span className="bg-primary-500/20 text-primary-300 text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border border-primary-500/30">Phase: Clinical Issuance</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400 font-medium">Patient:</span>
                      <span className="text-white font-black">{patientName}</span>
                      <span className="text-slate-600 px-2">•</span>
                      <span className="text-slate-400 font-medium">Ref:</span>
                      <span className="font-mono text-primary-400 font-bold tracking-tighter">#{appointmentId.substring(18).toUpperCase()}</span>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 relative z-10">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em]">Secure Consultation Mode</span>
             </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 bg-slate-50/50 custom-scrollbar">
              {/* 1. Medication Regime Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                         Medication Regime
                      </h4>
                      <p className="text-sm text-slate-500 font-medium">Specify dosages and durations carefully.</p>
                   </div>
                   <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addMedicine}
                      className="h-11 rounded-xl bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 font-black text-xs px-6 shadow-sm transition-all"
                   >
                      <Plus className="w-4 h-4 mr-2 text-primary-600" /> Add Compound
                   </Button>
                </div>

                <div className="space-y-6">
                  {medicines.map((m, idx) => (
                    <div key={idx} className="group relative bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-primary-100 animate-in fade-in slide-in-from-bottom-4">
                      <div className="space-y-10">
                         {/* Predictable Grid Alignment */}
                         <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-8 space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Medicine Name <span className="text-red-500">*</span></label>
                               <div className="relative group/input">
                                  <Pill className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-primary-500 transition-colors" />
                                  <Input 
                                    value={m.name} 
                                    onChange={e => updateMedicine(idx, 'name', e.target.value)}
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 text-slate-900 font-bold placeholder:text-slate-300 transition-all" 
                                    placeholder="e.g. Paracetamol 500mg"
                                  />
                               </div>
                            </div>
                            <div className="md:col-span-4 space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dosage Unit <span className="text-red-500">*</span></label>
                               <Input 
                                 value={m.dosage} 
                                 onChange={e => updateMedicine(idx, 'dosage', e.target.value)}
                                 className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 text-slate-700 font-bold transition-all" 
                                 placeholder="1 Tab / 5ml"
                                />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Frequency <span className="text-red-500">*</span></label>
                               <div className="relative">
                                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                  <Input 
                                    value={m.frequency} 
                                    onChange={e => updateMedicine(idx, 'frequency', e.target.value)}
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 text-slate-700 font-bold transition-all" 
                                    placeholder="1-0-1"
                                  />
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Duration <span className="text-red-500">*</span></label>
                               <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                  <Input 
                                    value={m.duration} 
                                    onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 pl-12 focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 text-slate-700 font-bold transition-all" 
                                    placeholder="5 Days"
                                  />
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Special Instructions</label>
                               <Input 
                                 value={m.instructions} 
                                 onChange={e => updateMedicine(idx, 'instructions', e.target.value)}
                                 className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 italic text-sm text-slate-500 focus:bg-white transition-all shadow-inner" 
                                 placeholder="After food..."
                               />
                            </div>
                         </div>

                         {medicines.length > 1 && (
                           <button 
                             type="button" 
                             onClick={() => removeMedicine(idx)}
                             className="absolute -right-3 -top-3 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:scale-110 border border-slate-100 transition-all opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Clinical Observations and Follow-up */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                       Clinical Guidance
                    </h4>
                    <Textarea 
                       value={advice}
                       onChange={e => setAdvice(e.target.value)}
                       placeholder="Dietary changes, lifestyle advice, or emergency warning signs..."
                       className="min-h-[180px] rounded-[1.5rem] bg-white border-2 border-slate-100 p-8 focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 text-sm leading-relaxed text-slate-700 font-medium shadow-inner transition-all"
                    />
                 </div>
                 
                 <div className="space-y-8 flex flex-col">
                    <div className="space-y-4">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          Recommended Follow-up
                       </h4>
                       <div className="relative group">
                          <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                          <Input 
                             type="date"
                             value={nextFollowUp}
                             onChange={e => setNextFollowUp(e.target.value)}
                             className="h-16 rounded-[1.25rem] border-2 border-slate-100 bg-white pl-16 pr-8 focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 font-black text-slate-900 shadow-sm transition-all"
                          />
                       </div>
                    </div>
                    
                    <div className="flex-1 p-10 rounded-[2rem] bg-slate-900 border border-slate-800 flex flex-col gap-5 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                             <CheckCircle2 className="w-5 h-5 text-primary-400" />
                          </div>
                          <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Sign-off Protocol</span>
                       </div>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium relative z-10">
                          By issuing this digital record, you confirm the clinical accuracy of the prescribed regime. This document is legally binding and will be archived in the patient's Health Vault.
                       </p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Pane: Internal Assessment (Always Visible for Clinical Focus) */}
            <div className="w-full lg:w-[380px] bg-white border-l border-slate-100 p-8 lg:p-10 flex flex-col gap-8 shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.02)]">
               <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <FileText className="w-4 h-4 text-slate-300" />
                     Private Assessment
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Internal notes only visible to you. Include diagnosis and observations.</p>
               </div>
               
               <div className="flex-1">
                  <Textarea 
                     value={notes}
                     onChange={e => setNotes(e.target.value)}
                     placeholder="Type private clinical observations..."
                     className="h-full min-h-[300px] rounded-[2rem] bg-slate-50/50 border-2 border-slate-50 p-8 focus:bg-white focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 text-xs italic text-slate-600 shadow-inner transition-all resize-none"
                  />
               </div>

               <div className="p-6 rounded-3xl bg-primary-50 border border-primary-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {patientName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest leading-none mb-1">Authorization</p>
                    <span className="text-sm font-black text-primary-900 truncate block max-w-[180px]">{patientName}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="px-8 py-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Digital Clinical Pad v2.4 Professional</span>
             </div>
             
             <div className="flex items-center gap-4 w-full sm:w-auto">
               <Button 
                 type="button" 
                 variant="ghost" 
                 onClick={() => onOpenChange(false)}
                 className="flex-1 sm:flex-none h-14 px-10 rounded-2xl font-black text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs"
               >
                 Cancel Session
               </Button>
               <Button 
                 type="submit" 
                 disabled={mutation.isPending}
                 className="flex-1 sm:flex-none h-14 bg-slate-900 hover:bg-primary-600 text-white font-black px-12 rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-primary-500/20 gap-3 text-xs transition-all active:scale-95 border-none"
               >
                 {mutation.isPending ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Finalizing...
                   </>
                 ) : (
                   <>
                     Issue Prescription
                     <ChevronRight className="w-4 h-4 ml-1" />
                   </>
                 )}
               </Button>
             </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
