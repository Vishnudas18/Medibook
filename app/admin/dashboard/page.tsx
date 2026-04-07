'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
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
import { 
  Users, 
  Stethoscope, 
  CalendarCheck, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  ShieldCheck 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any>>('/api/admin/stats');
      if (!data.success) throw new Error(data.error || 'Failed to fetch stats');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Patients', value: stats?.totalPatients || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Approved Doctors', value: stats?.totalDoctors || 0, icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Bookings', value: stats?.totalAppointments || 0, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Platform Revenue', value: `₹${stats?.totalRevenue?.toLocaleString()}`, icon: IndianRupee, color: 'text-primary-600', bg: 'bg-primary-50' },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
            Admin Overview
          </h1>
          <p className="text-slate-500 max-w-lg leading-relaxed">
            Real-time platform insights, revenue tracking, and operational performance metrics.
          </p>
        </div>
        
        {stats?.pendingDoctors > 0 && (
          <Badge className="h-10 px-6 rounded-xl bg-amber-500 text-white font-bold animate-bounce cursor-pointer" onClick={() => window.location.href = '/admin/doctors'}>
            {stats.pendingDoctors} pending doctors waiting for approval
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-white overflow-hidden">
             <div className="p-8 relative">
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-sm transition-transform group-hover:scale-110", card.bg, card.color)}>
                  <card.icon className="w-7 h-7" />
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{card.label}</p>
                 <h2 className="text-3xl font-black text-slate-900">{card.value}</h2>
               </div>
               {/* Decorative background circle */}
               <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-2xl", card.bg)} />
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-md bg-white p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Booking Velocity</h3>
              <p className="text-sm text-slate-400 font-medium tracking-tight">Active appointments over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-emerald-100">
              <TrendingUp className="w-4 h-4" />
              Growth +12%
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyStats || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#059669" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md bg-slate-900 text-white p-8 flex flex-col justify-between group overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/10 font-bold px-4 py-1.5 rounded-full backdrop-blur-md">
                System Status
              </Badge>
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            
            <h3 className="text-4xl font-black leading-tight">Payments Verified & Secure</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              All transactions are automatically verified via Razorpay webhooks. Revenue is calculated post-tax.
            </p>
          </div>
          
          <div className="relative z-10 pt-10">
            <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-lg flex gap-3 group/btn shadow-xl shadow-white/5 transition-all">
              Withdraw Funds
              <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Button>
          </div>
          
          <div className="absolute top-0 right-0 p-10 opacity-10 transition-transform group-hover:scale-125 duration-700">
             <ShieldCheck className="w-64 h-64 text-white" />
          </div>
        </Card>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
