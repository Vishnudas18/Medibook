'use client';

import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/shared/PageHeader';
import Link from 'next/link';
import { Calendar, Users, CalendarOff, UserCircle, ArrowRight, Clock, IndianRupee, TrendingUp } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, doctorProfile } = useAuth();

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
          { label: "Today's Patients", value: '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'This Week', value: '—', icon: Calendar, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Revenue (Month)', value: '—', icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg. Rating', value: doctorProfile?.rating?.toFixed(1) || '—', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'My Schedule', description: 'Set availability', href: '/doctor/schedule', icon: Calendar, color: 'from-primary-500 to-primary-600' },
          { title: 'Patients', description: 'View bookings', href: '/doctor/patients', icon: Users, color: 'from-blue-500 to-blue-600' },
          { title: 'Block Dates', description: 'Mark leave', href: '/doctor/leave', icon: CalendarOff, color: 'from-amber-500 to-amber-600' },
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
        <div className="flex items-center gap-3 mb-4"><Clock className="w-5 h-5 text-primary-500" /><h2 className="text-lg font-semibold text-slate-900">Today&apos;s Appointments</h2></div>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Calendar className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm">No appointments scheduled for today</p>
        </div>
      </div>
    </div>
  );
}
