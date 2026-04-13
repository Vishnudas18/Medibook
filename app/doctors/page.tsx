'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IDoctorProfile, IUser, PaginatedResponse } from '@/types';
import DoctorCard from '@/components/patient/DoctorCard';
import DoctorSearchFilters from '@/components/patient/DoctorSearchFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Stethoscope, FilterX, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FindDoctorsPage() {
  const [filters, setFilters] = useState({
    name: '',
    specialization: 'all',
    city: 'all',
    minFee: '',
    maxFee: '',
    page: 1,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.specialization !== 'all') params.append('specialization', filters.specialization);
      if (filters.city !== 'all') params.append('city', filters.city);
      if (filters.minFee) params.append('minFee', filters.minFee);
      if (filters.maxFee) params.append('maxFee', filters.maxFee);
      params.append('page', filters.page.toString());

      const { data } = await axios.get<ApiResponse<PaginatedResponse<IDoctorProfile & { userId: IUser }>>>(
        `/api/doctors?${params.toString()}`
      );
      if (!data.success) throw new Error(data.error || 'Failed to fetch doctors');
      return data.data;
    },
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-primary-600" />
          Find Your Doctor
        </h1>
        <p className="text-slate-500 max-w-2xl leading-relaxed">
          Search from India's top certified specialists and book instant video or clinic consultations. 
          Premium healthcare, just a few clicks away.
        </p>
      </div>

      <DoctorSearchFilters onFilterChange={handleFilterChange} isLoading={isLoading} />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {data?.total ?? 0} Doctors Found
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 space-y-4 border border-slate-100 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-20 w-20 rounded-xl" />
                  <div className="flex-1 space-y-2 py-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <RefreshCcw className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              We couldn't load the doctors at this moment. Please check your connection or try again.
            </p>
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl px-6">
              Retry Search
            </Button>
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.items.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <FilterX className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No doctors matched your criteria</h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <Button onClick={() => handleFilterChange({ name: '', specialization: 'all', city: 'all' })} variant="ghost" className="text-primary-600 hover:bg-primary-50">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
