'use client';

import Sidebar from '@/components/shared/Sidebar';
import Navbar from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <LoadingSpinner fullPage size="lg" text="Loading..." />;
  if (!isAuthenticated) return null;
  
  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
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
