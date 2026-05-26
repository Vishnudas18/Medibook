'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IDoctorProfile, IUser } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ApprovalRow from '@/components/admin/ApprovalRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, RefreshCcw, ShieldCheck, Stethoscope, Users, Clock, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const TABS = [
  { key: 'pending',  label: 'Pending',  color: 'amber',   icon: Clock },
  { key: 'approved', label: 'Active',   color: 'emerald', icon: Users },
  { key: 'rejected', label: 'Rejected', color: 'red',     icon: XCircle },
] as const;

type TabKey = typeof TABS[number]['key'];

const STATUS_STYLES: Record<string, { tab: string; active: string; badge: string; dot: string }> = {
  amber:   {
    tab:    'text-amber-600 border-amber-500 bg-amber-50',
    active: 'bg-amber-500',
    badge:  'bg-amber-100 text-amber-700',
    dot:    'bg-amber-400',
  },
  emerald: {
    tab:    'text-emerald-600 border-emerald-500 bg-emerald-50',
    active: 'bg-emerald-500',
    badge:  'bg-emerald-100 text-emerald-700',
    dot:    'bg-emerald-400',
  },
  red:     {
    tab:    'text-red-600 border-red-500 bg-red-50',
    active: 'bg-red-500',
    badge:  'bg-red-100 text-red-700',
    dot:    'bg-red-400',
  },
};

export default function AdminDoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('pending');

  const { data: doctors, isLoading, refetch, isRefetching } = useQuery({
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
    const name           = (d.userId as any)?.name?.toLowerCase()  || '';
    const email          = (d.userId as any)?.email?.toLowerCase() || '';
    const specialization = d.specialization?.toLowerCase()         || '';
    const q              = searchTerm.toLowerCase();
    return name.includes(q) || email.includes(q) || specialization.includes(q);
  }) ?? [];

  const byStatus = {
    pending:  filteredDoctors.filter(d => d.status === 'pending'),
    approved: filteredDoctors.filter(d => d.status === 'approved'),
    rejected: filteredDoctors.filter(d => d.status === 'rejected'),
  } as Record<TabKey, typeof filteredDoctors>;

  const currentList = byStatus[activeTab];

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 shadow-md shadow-primary-600/30">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Doctor Management
            </h1>
            <p className="text-sm text-slate-500">
              Verify credentials and manage provider status
            </p>
          </div>
        </div>

        {/* Search + Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="doctor-search"
              placeholder="Search name, email or specialty…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-10 w-72 rounded-lg border-slate-200 bg-white pl-9 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600"
            />
          </div>
          <Button
            id="doctor-refresh"
            onClick={() => refetch()}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-slate-200 bg-white text-slate-500 hover:text-primary-600 hover:border-primary-300"
            disabled={isRefetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {TABS.map(tab => {
          const count  = byStatus[tab.key].length;
          const styles = STATUS_STYLES[tab.color];
          const Icon   = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={`tab-card-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`group relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 hover:shadow-md ${
                isActive
                  ? `border-current ${styles.tab} shadow-sm`
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                isActive ? styles.badge : 'bg-slate-100'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  isActive ? 'opacity-80' : 'text-slate-400'
                }`}>{tab.label}</p>
                <p className="text-2xl font-bold leading-tight">
                  {isLoading ? '–' : count}
                </p>
              </div>
              {isActive && (
                <span className={`absolute bottom-0 left-0 h-0.5 w-full rounded-b-xl ${styles.active}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Table Card ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Table top bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[TABS.find(t => t.key === activeTab)!.color].dot}`} />
            <span className="text-sm font-semibold text-slate-700 capitalize">{activeTab} doctors</span>
            {!isLoading && (
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {currentList.length}
              </span>
            )}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/60 hover:bg-slate-50/60">
                <TableHead className="py-3 pl-6 text-[11px] font-bold uppercase tracking-widest text-slate-400 min-w-[220px]">
                  Doctor Details
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 min-w-[160px]">
                  Specialization
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 min-w-[130px]">
                  Location
                </TableHead>
                <TableHead className="py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 min-w-[110px]">
                  Status
                </TableHead>
                <TableHead className="py-3 pr-6 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400 min-w-[160px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i} className="border-slate-100">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-32 rounded" />
                          <Skeleton className="h-3 w-24 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-3.5 w-28 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-20 rounded-lg" />
                        <Skeleton className="h-8 w-20 rounded-lg" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : currentList.length > 0 ? (
                currentList.map(doctor => <ApprovalRow key={doctor._id} doctor={doctor} />)
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="mx-auto flex flex-col items-center gap-4 max-w-xs animate-fade-in">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <ShieldCheck className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-700">No doctors found</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {searchTerm
                            ? `No results for "${searchTerm}" in this category.`
                            : `There are no ${activeTab} registrations at this time.`}
                        </p>
                      </div>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
