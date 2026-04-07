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
  Circle
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
      <DialogContent className="sm:max-w-[90vw] lg:max-w-6xl w-[98vw] rounded-2xl bg-white p-0 border border-slate-200 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.3)] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-[80vh]">
          {/* Light Technical Header - Professional & Not Heavy */}
          <div className="bg-white px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm">
                   <Stethoscope className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-3">
                      <DialogTitle className="text-xl font-bold text-slate-900">Create Clinical Prescription</DialogTitle>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-100">Step 2 of 2</span>
                   </div>
                   <p className="text-xs text-slate-500 font-medium"> 
                      Patient: <span className="text-slate-900 font-bold">{patientName}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      Ref: <span className="font-mono text-indigo-600 cursor-help underline decoration-indigo-200 underline-offset-4">#{appointmentId.substring(18).toUpperCase()}</span>
                   </p>
                </div>
             </div>
             <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Consultation Session</span>
             </div>
          </div>

          {/* Central Workspace with Slate-50 Background for Depth */}
          <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12 custom-scrollbar bg-slate-50/40">
            {/* 1. Medication List Workspace */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    Medication Regime
                 </h4>
                 <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addMedicine}
                    className="h-10 rounded-lg border-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50 font-bold text-xs px-6 transition-all"
                 >
                    <Plus className="w-3 h-3 mr-2" /> Add Component
                 </Button>
              </div>

              <div className="space-y-6">
                {medicines.map((m, idx) => (
                  <div key={idx} className="group relative bg-white p-8 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
                    <div className="space-y-8">
                       {/* Predictable Grid Alignment */}
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                          <div className="md:col-span-8 space-y-2">
                             <label className="text-xs font-bold text-slate-600">Medicine Name</label>
                             <Input 
                               value={m.name} 
                               onChange={e => updateMedicine(idx, 'name', e.target.value)}
                               className="h-12 rounded-lg border-slate-300 bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 text-slate-900 font-medium placeholder:text-slate-300" 
                               placeholder="e.g. Amoxicillin 500mg"
                             />
                          </div>
                          <div className="md:col-span-4 space-y-2">
                             <label className="text-xs font-bold text-slate-600">Dosage Unit</label>
                             <Input 
                               value={m.dosage} 
                               onChange={e => updateMedicine(idx, 'dosage', e.target.value)}
                               className="h-12 rounded-lg border-slate-300 bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 text-slate-700 font-medium" 
                               placeholder="1 Tablet / 5ml"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-600">Frequency</label>
                             <Input 
                               value={m.frequency} 
                               onChange={e => updateMedicine(idx, 'frequency', e.target.value)}
                               className="h-12 rounded-lg border-slate-300 bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 text-slate-700 font-medium" 
                               placeholder="1-0-1 (BID)"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-600">Duration</label>
                             <Input 
                               value={m.duration} 
                               onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                               className="h-12 rounded-lg border-slate-300 bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 text-slate-700 font-medium" 
                               placeholder="5 days"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-600">Special Note (Optional)</label>
                             <Input 
                               value={m.instructions} 
                               onChange={e => updateMedicine(idx, 'instructions', e.target.value)}
                               className="h-12 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 italic text-sm text-slate-500" 
                               placeholder="Take after food..."
                             />
                          </div>
                       </div>

                       {medicines.length > 1 && (
                         <div className="absolute top-4 right-4">
                           <Button 
                             type="button" 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => removeMedicine(idx)}
                             className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Clinical Advice and Follow-up */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <AlertCircle className="w-4 h-4 text-amber-500" />
                     Clinical Guidance
                  </h4>
                  <Textarea 
                     value={advice}
                     onChange={e => setAdvice(e.target.value)}
                     placeholder="Lifestyle advice, dietary changes, or specific warnings..."
                     className="min-h-[140px] rounded-xl bg-white border border-slate-200 p-6 focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 text-sm leading-relaxed text-slate-700 font-medium"
                  />
               </div>
               
               <div className="space-y-8 flex flex-col">
                  <div className="space-y-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        Recommended Next Audit
                     </h4>
                     <Input 
                        type="date"
                        value={nextFollowUp}
                        onChange={e => setNextFollowUp(e.target.value)}
                        className="h-12 rounded-lg border border-slate-200 bg-white focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 font-bold text-slate-900 px-6"
                     />
                  </div>
                  
                  <div className="flex-1 p-8 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col gap-3">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Clinical Protocol</span>
                     </div>
                     <p className="text-[11px] text-indigo-700/80 leading-relaxed font-medium">
                        This record will be digitally signed and archived for compliance. By issuing, you confirm the clinical accuracy of this plan.
                     </p>
                  </div>
               </div>
            </div>

            {/* 3. Internal Notes */}
            <div className="space-y-4">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-slate-500" />
                  Internal Physician Observations
               </h4>
               <Textarea 
                  value={notes}
                  onChange={setNotes ? e => setNotes(e.target.value) : undefined}
                  placeholder="Record diagnosis and private clinical notes (Confidential focus)..."
                  className="min-h-[100px] rounded-xl bg-white border border-slate-200 p-6 focus:ring-8 focus:ring-indigo-600/5 focus:border-indigo-600 text-xs italic text-slate-500"
               />
            </div>
          </div>

          {/* Secure Technical Footer - Guaranteed Visibility */}
          <div className="px-10 py-6 border-t border-slate-200 bg-white grid grid-cols-1 md:grid-cols-2 items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                   {patientName[0].toUpperCase()}
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Clinic Authorization</p>
                   <span className="text-xs font-bold text-slate-800">{patientName}</span>
                </div>
             </div>
             <div className="flex items-center gap-3 w-full md:justify-end">
               <Button 
                 type="button" 
                 variant="ghost" 
                 onClick={() => onOpenChange(false)}
                 className="flex-1 md:flex-none h-11 px-8 font-bold text-slate-400 hover:text-slate-900 transition-all text-xs"
               >
                 Dismiss
               </Button>
               <Button 
                 type="submit" 
                 disabled={mutation.isPending}
                 className="flex-1 md:flex-none h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 shadow-lg shadow-indigo-500/20 gap-2 text-xs transition-all active:scale-95 border-none"
               >
                 {mutation.isPending ? 'Finalizing...' : 'Issue Prescription'}
                 {!mutation.isPending && <ChevronRight className="w-4 h-4" />}
               </Button>
             </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
