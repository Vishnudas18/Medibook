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
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { cn } from '@/lib/utils';

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
    totalConsultations: 0,
    avgRating: doctorProfile?.rating || 0
  };

  const todayAppointments = statsData?.todayAppointments || [];

  const status = doctorProfile?.status || 'pending';
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: '⏳ Pending Approval' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '✅ Approved' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: '❌ Rejected' },
  };
  const statusInfo = statusConfig[status] || statusConfig.pending;

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader 
          title={`Welcome back, Dr. ${user?.name?.split(' ')[0] || 'Doctor'}`} 
          description="Here is what's happening with your practice today." 
        />
        
        {status !== 'approved' && (
          <div className={cn(
            "px-6 py-3 rounded-2xl border text-sm font-bold shadow-sm flex items-center gap-3 animate-pulse",
            status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-red-50 border-red-100 text-red-700'
          )}>
            {statusInfo.label}
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
            <span className="font-medium opacity-80">
              {status === 'pending' ? 'Verification in progress' : 'Profile needs attention'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Patients", value: stats.todayPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-50/50 to-transparent' },
          { label: 'Weekly Load', value: stats.weekPatients, icon: CalendarDays, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-50/50 to-transparent' },
          { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-50/50 to-transparent' },
          { label: 'Total Consultations', value: stats.totalConsultations, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-50/50 to-transparent' },
        ].map((stat) => (
          <div key={stat.label} className="relative group overflow-hidden p-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-500">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.gradient)} />
            <div className="relative z-10">
              <div className={cn("p-3 rounded-2xl w-fit mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black text-slate-900 tracking-tight">
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-slate-200" /> : stat.value}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Appointments - Larger Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary-500" />
              Today&apos;s Appointments
            </h2>
            <Link href="/doctor/schedule" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 uppercase tracking-widest">
              View Schedule <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500/20" />
                <p className="text-sm font-medium text-slate-400">Syncing your consultations...</p>
              </div>
            ) : todayAppointments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {todayAppointments.map((apt: any) => (
                  <div key={apt._id} className="group flex items-center justify-between p-6 hover:bg-slate-50/80 transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                        {apt.patientId?.image ? (
                          <img src={apt.patientId.image} alt={apt.patientId.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-slate-400">{apt.patientId?.name?.[0] || 'P'}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          {apt.patientId?.name || 'Unknown Patient'}
                          {apt.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 line-clamp-1 max-w-[200px]">{apt.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-900">{apt.startTime}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment</p>
                      </div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm",
                        apt.status === 'completed' 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                          : 'bg-primary-50 border-primary-100 text-primary-700'
                      )}>
                        {apt.status}
                      </div>
                      <Link 
                        href={`/doctor/patients/${apt.patientId?._id}`}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:text-primary-600 hover:border-primary-200 hover:shadow-lg transition-all"
                      >
                         <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Clear Schedule</h3>
                <p className="text-sm text-slate-500 max-w-[220px]">You have no appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Side Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 px-2">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { title: 'Clinical Schedule', description: 'Manage availability', href: '/doctor/schedule', icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Patient Registry', description: 'History & bookings', href: '/doctor/patients', icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { title: 'Leave Management', description: 'Block out dates', icon: CalendarOff, color: 'text-amber-600', bg: 'bg-amber-50', href: '/doctor/leave' },
              { title: 'Doctor Profile', description: 'Public information', href: '/doctor/profile', icon: UserCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((action) => (
              <Link key={action.title} href={action.href} className="flex items-center gap-5 p-5 bg-white rounded-3xl border border-slate-200/60 hover:border-primary-200 hover:shadow-xl transition-all duration-300 group">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", action.bg)}>
                  <action.icon className={cn("w-6 h-6", action.color)} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{action.title}</h3>
                  <p className="text-xs font-medium text-slate-500">{action.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-primary-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
