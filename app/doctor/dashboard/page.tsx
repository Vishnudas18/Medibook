'use client';

import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/shared/PageHeader';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  CalendarOff, 
  UserCircle, 
  ArrowRight, 
  Clock, 
  IndianRupee, 
  TrendingUp,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

export default function DoctorDashboard() {
  const { user, doctorProfile } = useAuth();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['doctor-stats'],
    queryFn: async () => {
      const { data } = await axios.get('/api/doctor/stats');
      return data.data;
    },
    enabled: !!user,
  });

  const stats = statsData?.stats || {
    todayPatients: 0,
    weekPatients: 0,
    monthlyRevenue: 0,
    avgRating: doctorProfile?.rating || 0
  };

  const todayAppointments = statsData?.todayAppointments || [];

  const status = doctorProfile?.status || 'pending';
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: '⏳ Pending Approval' },
    approved: { bg: 'bg-green-50', text: 'text-green-700', label: '✅ Approved' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: '❌ Rejected' },
  };
  const statusInfo = statusConfig[status] || statusConfig.pending;

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Hello, Dr. ${user?.name?.split(' ')[0] || 'Doctor'}! 👋`} description="Manage your schedule and patients" />

      {status !== 'approved' && (
        <div className={`p-4 ${statusInfo.bg} rounded-xl border mb-8 ${status === 'pending' ? 'border-amber-200' : 'border-red-200'}`}>
          <p className={`text-sm font-medium ${statusInfo.text}`}>
            {statusInfo.label}
            {status === 'pending' && ' — Your profile is being reviewed by our admin team.'}
            {status === 'rejected' && ` — Reason: ${doctorProfile?.rejectionReason || 'Not specified'}`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Today's Patients", value: stats.todayPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'This Week', value: stats.weekPatients, icon: CalendarDays, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Revenue (Month)', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg. Rating', value: stats.avgRating.toFixed(1), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
            <div className="text-3xl font-bold text-slate-900">
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-slate-200" /> : stat.value}
            </div>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'My Schedule', description: 'Set availability', href: '/doctor/schedule', icon: Calendar, color: 'from-primary-500 to-primary-600' },
          { title: 'Patients', description: 'View bookings', href: '/doctor/patients', icon: Users, color: 'from-blue-500 to-blue-600' },
          { title: 'Block Dates', description: 'Mark leave', icon: CalendarOff, color: 'from-amber-500 to-amber-600', href: '/doctor/leave' },
          { title: 'Profile', description: 'Update profile', href: '/doctor/profile', icon: UserCircle, color: 'from-purple-500 to-purple-600' },
        ].map((action) => (
          <Link key={action.title} href={action.href} className="group p-6 bg-white rounded-2xl border border-slate-200/60 hover:border-primary-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><action.icon className="w-6 h-6 text-white" /></div>
            <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
            <p className="text-sm text-slate-500 mb-3">{action.description}</p>
            <div className="flex items-center gap-1 text-sm text-primary-600 font-medium group-hover:gap-2 transition-all">Open <ArrowRight className="w-3.5 h-3.5" /></div>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-8 bg-white rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Appointments</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : todayAppointments.length > 0 ? (
          <div className="space-y-4">
            {todayAppointments.map((apt: any) => (
              <div key={apt._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {apt.patientId?.name?.[0] || 'P'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{apt.patientId?.name || 'Unknown Patient'}</h4>
                    <p className="text-xs text-slate-500">{apt.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{apt.startTime} - {apt.endTime}</p>
                    <p className="text-[10px] text-slate-400">Appointment Time</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    apt.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-primary-50 text-primary-700'
                  }`}>
                    {apt.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Calendar className="w-12 h-12 mb-3 text-slate-300" />
            <p className="text-sm">No appointments scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
}
