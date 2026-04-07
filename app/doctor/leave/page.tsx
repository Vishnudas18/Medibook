'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, ILeaveDate } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveSchema, LeaveInput } from '@/schemas/doctor.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarX, Plus, Trash2, Calendar, Info, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useState } from 'react';

export default function DoctorLeavePage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves', 'doctor'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<ILeaveDate[]>>('/api/doctors/leave');
      if (!data.success) throw new Error(data.error || 'Failed to fetch leave dates');
      return data.data || [];
    },
  });

  const form = useForm<LeaveInput>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      reason: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: LeaveInput) => {
      const { data } = await axios.post<ApiResponse<any>>('/api/doctors/leave', values);
      if (!data.success) throw new Error(data.error || 'Failed to block date');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete('/api/doctors/leave', { data: { id } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setDeleteId(null);
    },
  });

  const onSubmit = (values: LeaveInput) => {
    createMutation.mutate(values);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <CalendarX className="w-8 h-8 text-primary-600" />
          Leave Management
        </h1>
        <p className="text-slate-500 max-w-2xl leading-relaxed">
          Block specific dates where you are unavailable for consultations (holidays, personal leave, etc). 
          Any new booking attempts for these dates will be blocked.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Form Section */}
        <section className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Block New Date</h3>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField<LeaveInput, 'date'>
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField<LeaveInput, 'reason'>
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reason (Internal)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Annual Holiday" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/25 transition-all"
              >
                {createMutation.isPending ? 'Blocking...' : 'Block Date'}
              </Button>
            </form>
          </Form>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
             <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
             <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                Note: Once a date is blocked, it will be immediately removed from your bookable slots. 
                Already confirmed appointments for this date will <strong>not</strong> be auto-cancelled.
             </p>
          </div>
        </section>

        {/* List Section */}
        <section className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                Upcoming Leaves ({leaves?.length || 0})
              </h3>
           </div>

           {isLoading ? (
             <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                ))}
             </div>
           ) : leaves && leaves.length > 0 ? (
             <div className="grid grid-cols-1 gap-4">
               {leaves.map((leave) => (
                 <div key={leave._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-red-100 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                        <Calendar className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="font-bold text-slate-900">{format(new Date(leave.date), 'PPPP')}</p>
                       <p className="text-sm text-slate-500 font-medium">Reason: {leave.reason}</p>
                     </div>
                   </div>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={() => setDeleteId(leave._id)}
                     className="h-10 w-10 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                   >
                     <Trash2 className="w-5 h-5" />
                   </Button>
                 </div>
               ))}
             </div>
           ) : (
             <div className="py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-200" />
                 </div>
                 <h4 className="font-bold text-slate-900 mb-1">No upcoming leaves</h4>
                 <p className="text-sm text-slate-400 max-w-[200px]">You haven't blocked any dates for the future yet.</p>
             </div>
           )}
        </section>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Unblock Date?"
        description="This will make your standard schedule slots available again for this date. Continue?"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
