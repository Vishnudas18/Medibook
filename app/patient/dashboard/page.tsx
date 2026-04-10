'use client';

import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/shared/PageHeader';
import Link from 'next/link';
import { CalendarDays, Search, UserCircle, ArrowRight, Activity, TrendingUp, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/patient/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchStats();
    }
  }, [user]);

  const nextAppointmentDisplay = stats?.nextAppointment 
    ? format(new Date(stats.nextAppointment.date), 'MMM dd') + ', ' + stats.nextAppointment.startTime
    : loading ? '...' : 'None';

  const statCards = [
    { 
      label: 'Upcoming', 
      value: nextAppointmentDisplay, 
      icon: Clock, 
      trend: 'Next appointment', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'This Month', 
      value: loading ? '...' : stats?.stats?.monthAppointments || '0', 
      icon: CalendarDays, 
      trend: 'Appointments', 
      color: 'text-primary-600', 
      bg: 'bg-primary-50' 
    },
    { 
      label: 'Health Score', 
      value: '—', 
      icon: Activity, 
      trend: 'Coming soon', 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}! 👋`} description="Manage your appointments and health journey" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="group p-6 bg-white rounded-2xl border border-slate-200/60 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
              <TrendingUp className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors" />
            </div>
            <div className={`font-bold text-slate-900 ${stat.value.length > 10 ? 'text-xl' : 'text-3xl'}`}>
              {stat.value}
            </div>
            <p className="text-sm text-slate-500 mt-1">{stat.trend}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Find a Doctor', description: 'Search and book appointments with verified doctors', href: '/patient/doctors', icon: Search, color: 'from-blue-500 to-blue-600' },
          { title: 'My Appointments', description: 'View your upcoming and past appointments', href: '/patient/appointments', icon: CalendarDays, color: 'from-primary-500 to-primary-600' },
          { title: 'My Profile', description: 'Update your personal information', href: '/patient/profile', icon: UserCircle, color: 'from-purple-500 to-purple-600' },
        ].map((action) => (
          <Link key={action.title} href={action.href} className="group p-6 bg-white rounded-2xl border border-slate-200/60 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{action.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{action.description}</p>
            <div className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">Go <ArrowRight className="w-4 h-4" /></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
