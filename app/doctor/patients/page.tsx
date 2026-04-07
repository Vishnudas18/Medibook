'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IAppointment, AppointmentStatus } from '@/types';
import AppointmentCard from '@/components/patient/AppointmentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FilterX, Search, RefreshCcw, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function DoctorPatientsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', 'doctor'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<IAppointment[]>>('/api/appointments/doctor');
      if (!data.success) throw new Error(data.error || 'Failed to fetch appointments');
      return data.data || [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string, status: string, notes?: string }) => {
      const { data } = await axios.patch(`/api/appointments/${id}`, { status, notes });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const filteredAppointments = appointments?.filter(a => {
    const patientName = (a.patientId as any)?.name?.toLowerCase() || '';
    return patientName.includes(searchTerm.toLowerCase());
  }) || [];

  const todayAppointments = filteredAppointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    const appDate = new Date(a.date).toISOString().split('T')[0];
    return appDate === today && (a.status === 'confirmed' || a.status === 'pending');
  });

  const upcomingAppointments = filteredAppointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    const appDate = new Date(a.date).toISOString().split('T')[0];
    return appDate > today && (a.status === 'confirmed' || a.status === 'pending');
  });

  const pastAppointments = filteredAppointments.filter(a => 
    a.status === 'completed' || a.status === 'cancelled' || a.status === 'no-show'
  );

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    statusMutation.mutate({ id, status });
  };

  const handleCancel = (id: string) => {
    statusMutation.mutate({ id, status: 'cancelled' });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            Patient Records
          </h1>
          <p className="text-slate-500 max-w-lg leading-relaxed">
            Manage your scheduled patients, track appointment history, and update consultation statuses.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl border-slate-200 focus:bg-white" 
            />
          </div>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl h-12 px-4 border-slate-200">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="bg-white/50 border border-slate-100 p-1.5 rounded-2xl h-14 w-full flex justify-start sm:w-auto mb-8 shadow-sm">
          <TabsTrigger value="today" className="rounded-xl px-10 font-bold flex gap-2">
            Today <div className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-[10px]">{todayAppointments.length}</div>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-xl px-10 font-bold flex gap-2">
            Upcoming <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">{upcomingAppointments.length}</div>
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-10 font-bold flex gap-2">
            History <div className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{pastAppointments.length}</div>
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : filteredAppointments.length === 0 && searchTerm ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center animate-fade-in shadow-inner">
             <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <FilterX className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No patients found matching "{searchTerm}"</h3>
              <p className="text-slate-500 max-w-sm">
                Try searching for a different name or clear the search field.
              </p>
          </div>
        ) : (
          <>
            <TabsContent value="today" className="space-y-6 mt-0">
              {todayAppointments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {todayAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment as any}
                      userRole="doctor"
                      onStatusChange={handleStatusChange}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={ClipboardList} title="No appointments for today" description="Relax! You have no sessions scheduled for today." />
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6 mt-0">
               {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment as any}
                      userRole="doctor"
                      onStatusChange={handleStatusChange}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={CalendarIcon} title="No future appointments" description="No upcoming sessions for this patient search criteria." />
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6 mt-0">
               {pastAppointments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment as any}
                      userRole="doctor"
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={FilterX} title="No history found" description="Completed or cancelled records will appear here." />
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center animate-fade-in shadow-inner">
      <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function CalendarIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }
