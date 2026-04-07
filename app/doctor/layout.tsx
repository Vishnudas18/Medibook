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
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block w-72 flex-shrink-0">
        <Sidebar role="doctor" />
      </div>
      <div className="lg:hidden">
         <Sidebar role="doctor" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
