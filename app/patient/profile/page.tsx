'use client';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/shared/PageHeader';
import { Mail, Phone, Shield } from 'lucide-react';

export default function PatientProfilePage() {
  const { user } = useAuth();
  return (
    <div className="animate-fade-in">
      <PageHeader title="My Profile" description="View and manage your account" />
      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          <div className="h-32 gradient-primary relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center gradient-primary text-white text-3xl font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-8">
            <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
            <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full capitalize"><Shield className="w-3.5 h-3.5" />{user?.role}</span>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"><Mail className="w-5 h-5 text-slate-400" /><div><p className="text-xs text-slate-400">Email</p><p className="text-sm font-medium text-slate-900">{user?.email}</p></div></div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"><Phone className="w-5 h-5 text-slate-400" /><div><p className="text-xs text-slate-400">Phone</p><p className="text-sm font-medium text-slate-900">{user?.phone || 'Not set'}</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
