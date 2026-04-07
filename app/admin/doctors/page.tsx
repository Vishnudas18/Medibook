'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IDoctorProfile, IUser } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ApprovalRow from '@/components/admin/ApprovalRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, RefreshCcw, ShieldCheck, Stethoscope } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const { data: doctors, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<(IDoctorProfile & { userId: IUser })[]>>(
        '/api/admin/doctors'
      );
      if (!data.success) throw new Error(data.error || 'Failed to fetch doctors');
      return data.data || [];
    },
  });

  const filteredDoctors = doctors?.filter(d => {
    const name = (d.userId as any)?.name?.toLowerCase() || '';
    const email = (d.userId as any)?.email?.toLowerCase() || '';
    const specialization = d.specialization?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search) || specialization.includes(search);
  }) || [];

  const pendingDoctors = filteredDoctors.filter(d => d.status === 'pending');
  const approvedDoctors = filteredDoctors.filter(d => d.status === 'approved');
  const rejectedDoctors = filteredDoctors.filter(d => d.status === 'rejected');

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-primary-600" />
            Doctor Management
          </h1>
          <p className="text-slate-500 max-w-lg leading-relaxed">
            Verify medical credentials, approve registrations, and manage provider status across the platform.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name, email or speciality..."
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

      <Tabs defaultValue="pending" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/50 border border-slate-100 p-1.5 rounded-2xl h-14 w-fit max-w-full flex justify-start overflow-x-auto no-scrollbar mb-8 shadow-sm">
          <TabsTrigger value="pending" className="flex-shrink-0 rounded-xl px-6 sm:px-10 font-bold flex gap-2">
            Pending <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px]">{pendingDoctors.length}</div>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex-shrink-0 rounded-xl px-6 sm:px-10 font-bold flex gap-2">
            Active <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">{approvedDoctors.length}</div>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex-shrink-0 rounded-xl px-6 sm:px-10 font-bold flex gap-2">
            Rejected <div className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px]">{rejectedDoctors.length}</div>
          </TabsTrigger>
        </TabsList>

        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="py-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest pl-8 min-w-[250px]">Doctor Details</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest min-w-[150px]">Specialization</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest min-w-[120px]">Location</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest min-w-[120px]">Status</TableHead>
                  <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right pr-8 min-w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-8 py-5"><Skeleton className="h-12 w-48 rounded-xl" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="pr-8 text-right"><Skeleton className="h-9 w-24 ml-auto rounded-xl" /></TableCell>
                    </TableRow>
                  ))
                ) : activeTab === 'pending' && pendingDoctors.length > 0 ? (
                  pendingDoctors.map(doctor => <ApprovalRow key={doctor._id} doctor={doctor} />)
                ) : activeTab === 'approved' && approvedDoctors.length > 0 ? (
                  approvedDoctors.map(doctor => <ApprovalRow key={doctor._id} doctor={doctor} />)
                ) : activeTab === 'rejected' && rejectedDoctors.length > 0 ? (
                  rejectedDoctors.map(doctor => <ApprovalRow key={doctor._id} doctor={doctor} />)
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                           <ShieldCheck className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No doctors found</h3>
                        <p className="text-slate-500 max-w-sm">
                          {searchTerm ? `No results for "${searchTerm}" in this category.` : `There are currently no doctors in the ${activeTab} category.`}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </Tabs>
    </div>
  );
}
