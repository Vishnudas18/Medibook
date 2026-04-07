'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, RefreshCcw, CalendarDays, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { ApiResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Define the shape of the populated appointment data from our API
interface PopulatedAppointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  doctorId: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    specialization: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  isPaid: boolean;
  createdAt: string;
}

export default function AdminAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<PopulatedAppointment[]>>('/api/admin/appointments');
      if (!data.success) throw new Error(data.error || 'Failed to fetch appointments');
      return data.data || [];
    },
  });

  const filteredAppointments = appointments?.filter((appt) => {
    const patientName = appt.patientId?.name?.toLowerCase() || '';
    const doctorName = appt.doctorId?.userId?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return patientName.includes(search) || doctorName.includes(search);
  }) || [];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader 
          title="All Appointments" 
          description="View and monitor all platform appointments across doctors." 
        />
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search patient or doctor..."
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

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="py-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest pl-8">Patient Details</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Doctor</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Schedule</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-8 py-5"><Skeleton className="h-12 w-48 rounded-xl" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-36 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt) => (
                <TableRow key={appt._id} className="hover:bg-slate-50/80 transition-colors border-slate-100 cursor-default">
                  
                  {/* PATIENT */}
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={appt.patientId?.avatar} alt={appt.patientId?.name || 'Patient'} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                          {appt.patientId?.name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{appt.patientId?.name || 'Unknown Patient'}</span>
                        <span className="text-xs text-slate-500">{appt.patientId?.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* DOCTOR */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">Dr. {appt.doctorId?.userId?.name || 'Unknown'}</span>
                      <span className="text-xs text-primary-600 font-medium truncate max-w-[150px]">
                        {appt.doctorId?.specialization || 'General'}
                      </span>
                    </div>
                  </TableCell>

                  {/* SCHEDULE */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                        {appt.startTime} - {appt.endTime}
                      </span>
                    </div>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    {appt.status === 'confirmed' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Confirmed</Badge>
                    ) : appt.status === 'completed' ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>
                    ) : appt.status === 'cancelled' ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Cancelled</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Pending</Badge>
                    )}
                  </TableCell>

                  {/* PAYMENT */}
                  <TableCell>
                    {appt.isPaid ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none">Paid</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none">Pending</Badge>
                    )}
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                       <ShieldCheck className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No appointments</h3>
                    <p className="text-slate-500 max-w-sm">
                      {searchTerm ? `No results found for "${searchTerm}".` : "No dummy or real appointments have been booked yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
