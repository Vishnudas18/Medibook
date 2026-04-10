'use client';

import Sidebar from '@/components/shared/Sidebar';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'doctor')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <LoadingSpinner fullPage size="lg" text="Securing Clinical Portal..." />;
  if (!isAuthenticated || user?.role !== 'doctor') return null;
  
  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar role="doctor" />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
