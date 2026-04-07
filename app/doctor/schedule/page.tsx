'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IAvailability } from '@/types';
import AvailabilityForm from '@/components/doctor/AvailabilityForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DoctorSchedulePage() {
  const { data: availabilities, isLoading, isError } = useQuery({
    queryKey: ['availability', 'doctor'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<IAvailability[]>>('/api/doctors/availability');
      if (!data.success) throw new Error(data.error || 'Failed to fetch availability');
      return data.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 w-1/3 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary-600" />
            My Weekly Schedule
          </h1>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            Configure your standard availability for each day of the week. This will be used to generate
            bookable slots for your patients.
          </p>
        </div>
        
        <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary-100 bg-primary-50 text-primary-700 font-bold gap-2">
          <ShieldCheck className="w-4 h-4" /> Schedule Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1 bg-slate-100/50 rounded-[2rem] border border-slate-100 shadow-inner">
        {dayNames.map((day, index) => {
          const existingData = availabilities?.find(a => a.dayOfWeek === index);
          
          return (
            <div key={day} className="bg-white p-8 rounded-[1.75rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-primary-100 group relative overflow-hidden">
               {existingData?.isActive ? (
                  <div className="absolute top-0 right-0 p-2 transform rotate-45 translate-x-4 -translate-y-4 bg-primary-500 text-white transition-opacity group-hover:opacity-100 opacity-0">
                    <div className="px-8 py-0.5 text-[8px] font-bold uppercase tracking-widest text-center">Active</div>
                  </div>
               ) : (
                 <div className="absolute inset-0 bg-slate-50/10 backdrop-grayscale-[0.5] z-0 pointer-events-none opacity-50" />
               )}
              
               <div className="relative z-10">
                 <AvailabilityForm 
                   dayOfWeek={index} 
                   initialData={existingData} 
                 />
               </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-3xl bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4 items-start animate-fade-in shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <Info className="w-6 h-6 text-amber-500" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 text-sm italic">Pro Tip for Managing Availability</h4>
          <p className="text-xs text-amber-800/80 leading-relaxed font-medium transition-colors">
            Changes to your weekly schedule will apply immediately to all future dates. 
            Individual appointment slots that are already booked will <strong>not</strong> be affected. 
            To block specific holidays or personal days off, use the <strong>Leave Management</strong> section.
          </p>
        </div>
      </div>
    </div>
  );
}
