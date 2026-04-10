'use client';
import Sidebar from '@/components/shared/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <LoadingSpinner fullPage size="lg" text="Securing Admin Portal..." />;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" />
      <main className="flex-1">
        <div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
