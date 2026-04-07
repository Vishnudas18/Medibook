'use client';
import Sidebar from '@/components/shared/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <LoadingSpinner fullPage size="lg" text="Loading..." />;
  if (!isAuthenticated) return null;
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" />
      <main className="flex-1"><div className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto animate-fade-in">{children}</div></main>
    </div>
  );
}
