'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Stethoscope,
  LayoutDashboard,
  Search,
  CalendarDays,
  UserCircle,
  LogOut,
  Menu,
  X,
  Calendar,
  Users,
  CalendarOff,
  Shield,
  ClipboardList,
  UserCog,
  BarChart3,
  Pill,
  CreditCard,
  Activity,
  Settings,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Home', href: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Find Doctors', href: '/patient/doctors', icon: Search },
    { label: 'My Appointments', href: '/patient/appointments', icon: CalendarDays },
    { label: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
    { label: 'Health Vault', href: '/patient/vault', icon: FileText },
    { label: 'Payments', href: '/patient/payments', icon: CreditCard },
    { label: 'Profile', href: '/patient/profile', icon: UserCircle },
  ],
  doctor: [
    { label: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/doctor/analytics', icon: BarChart3 },
    { label: 'My Schedule', href: '/doctor/schedule', icon: Calendar },
    { label: 'Patients', href: '/doctor/patients', icon: Users },
    { label: 'Leave', href: '/doctor/leave', icon: CalendarOff },
    { label: 'Profile', href: '/doctor/profile', icon: UserCircle },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { label: 'Doctor Approvals', href: '/admin/doctors', icon: Shield },
    { label: 'Appointments', href: '/admin/appointments', icon: ClipboardList },
    { label: 'Users', href: '/admin/users', icon: UserCog },
    { label: 'System Logs', href: '/admin/logs', icon: Activity },
    { label: 'Site Settings', href: '/admin/settings', icon: Settings },
  ],
};

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const items = navItems[role] || [];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">
                Medi<span className="text-primary-600">Book</span>
              </span>
              <p className="text-xs text-slate-400 capitalize">{role} Portal</p>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-primary-600' : 'text-slate-400'
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="p-4 border-t border-slate-100">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
