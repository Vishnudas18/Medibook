'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IAppointment, AppointmentStatus } from '@/types';
import AppointmentCard from '@/components/patient/AppointmentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, FilterX, Search, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function PatientAppointmentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', 'patient'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<IAppointment[]>>('/api/appointments');
      if (!data.success) throw new Error(data.error || 'Failed to fetch appointments');
      return data.data || [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
      const { data } = await axios.delete(`/api/appointments/${id}`, { data: { reason } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const upcomingAppointments = appointments?.filter(a => 
    a.status === 'confirmed' || a.status === 'pending'
  ) || [];

  const pastAppointments = appointments?.filter(a => 
    a.status === 'completed' || a.status === 'cancelled' || a.status === 'no-show'
  ) || [];

  const handleCancel = (id: string) => {
    cancelMutation.mutate({ id, reason: 'Cancelled by patient' });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary-600" />
            My Appointments
          </h1>
          <p className="text-slate-500 max-w-lg leading-relaxed">
            Manage your scheduled visits, view medical history, and track payment receipts in one place.
          </p>
        </div>
        
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl h-12 px-6 gap-2 border-slate-200">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 w-full sm:w-auto mb-8">
          <TabsTrigger value="upcoming" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-sm">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-sm">
            History ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment as any}
                  userRole="patient"
                  onCancel={handleCancel}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                <CalendarDays className="w-10 h-10 text-primary-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming appointments</h3>
              <p className="text-slate-500 mb-6 max-w-sm">
                You haven't booked any sessions yet. Search for a doctor to get started.
              </p>
              <Button onClick={() => window.location.href = '/patient/doctors'} className="rounded-xl px-8 font-bold bg-primary-600 hover:bg-primary-700">
                Book an Appointment
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment as any}
                  userRole="patient"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <FilterX className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No history found</h3>
              <p className="text-slate-500 max-w-sm">
                Completed or cancelled appointments will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
