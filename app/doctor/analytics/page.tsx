'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  IndianRupee, 
  TrendingUp, 
  CalendarCheck, 
  XOctagon, 
  Activity 
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { cn } from '@/lib/utils';

export default function DoctorAnalyticsPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['doctor-analytics'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any>>('/api/doctor/analytics');
      if (!data.success) throw new Error(data.error || 'Failed to fetch analytics');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader title="Revenue & Analytics" description="Loading your performance metrics..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Revenue & Analytics" description="Track your earnings and patient outcomes" />
        <div className="p-8 bg-red-50 text-red-700 rounded-3xl border border-red-100 flex flex-col items-center justify-center min-h-[300px]">
          <XOctagon className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="font-bold text-lg">Failed to load analytics</h3>
          <p className="opacity-80">There was a problem fetching your data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Earnings', value: `₹${stats?.totalRevenue?.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Appointments', value: stats?.totalAppointments, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed Visits', value: stats?.completedAppointments, icon: CalendarCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Cancelled / No-shows', value: stats?.cancelledAppointments, icon: XOctagon, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader title="Revenue & Analytics" description="Track your earnings, monitor consultation volume, and view performance trends." />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white overflow-hidden">
             <div className="p-8 relative">
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-sm transition-transform group-hover:scale-110", card.bg, card.color)}>
                  <card.icon className="w-7 h-7" />
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{card.label}</p>
                 <h2 className="text-3xl font-black text-slate-900">{card.value}</h2>
               </div>
               {/* Decorative floating blur effect */}
               <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-2xl", card.bg)} />
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Growth Chart */}
        <Card className="rounded-[2.5rem] border border-slate-200/60 shadow-md bg-white p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Revenue Growth</h3>
              <p className="text-sm text-slate-400 font-medium tracking-tight">Monthly earnings over the last 6 months</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-emerald-100 w-fit">
              <TrendingUp className="w-4 h-4" /> Earnings Target
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', fontWeight: 'bold' }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#059669" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Consultation Volume Chart */}
        <Card className="rounded-[2.5rem] border border-slate-200/60 shadow-md bg-white p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Consultation Volume</h3>
              <p className="text-sm text-slate-400 font-medium tracking-tight">Completed sessions over time</p>
            </div>
            <div className="flex items-center gap-2 text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-primary-100 w-fit">
               <Activity className="w-4 h-4" /> Patient Flow
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData || []} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', fontWeight: 'bold' }}
                  formatter={(value: any) => [value, 'Completed']}
                />
                <Bar 
                  dataKey="completed" 
                  fill="#3b82f6" 
                  radius={[6, 6, 6, 6]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
