'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Command, 
  LayoutDashboard, 
  User, 
  Stethoscope, 
  Calendar, 
  Shield, 
  X,
  Plus,
  ArrowRight,
  ClipboardList,
  Pill,
  Settings,
  History,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  icon: any;
  label: string;
  href: string;
  category: 'Navigation' | 'Actions' | 'Tools';
  roles?: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', category: 'Navigation' },
    { icon: User, label: 'Profile Settings', href: user?.role === 'doctor' ? '/doctor/profile' : '/patient/profile', category: 'Navigation' },
    { icon: Stethoscope, label: 'Find a Specialist', href: '/patient/doctors', category: 'Navigation', roles: ['patient'] },
    { icon: Calendar, label: 'My Appointments', href: user?.role === 'doctor' ? '/doctor/schedule' : '/patient/appointments', category: 'Navigation', roles: ['doctor', 'patient'] },
    { icon: Shield, label: 'Health Vault', href: '/patient/vault', category: 'Navigation', roles: ['patient'] },
    { icon: Pill, label: 'Prescriptions', href: '/patient/prescriptions', category: 'Navigation', roles: ['patient'] },
    { icon: ClipboardList, label: 'Patient Records', href: '/doctor/patients', category: 'Navigation', roles: ['doctor'] },
    { icon: Settings, label: 'Admin Panel', href: '/admin/dashboard', category: 'Navigation', roles: ['admin'] },
    { icon: Plus, label: 'New Consultation', href: '/patient/doctors', category: 'Actions', roles: ['patient'] },
    { icon: Activity, label: 'View Analytics', href: '/doctor/analytics', category: 'Tools', roles: ['doctor'] },
    { icon: History, label: 'System Logs', href: '/admin/logs', category: 'Tools', roles: ['admin'] },
  ];

  const filteredItems = navItems.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !item.roles || (user && item.roles.includes(user.role));
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const onSelect = useCallback((href: string) => {
    setIsOpen(false);
    router.push(href);
  }, [router]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden bg-white/70 backdrop-blur-2xl border-white/20 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.25)] rounded-[2.5rem] animate-in zoom-in-95 duration-300">
        <div className="flex flex-col h-[600px]">
          {/* Header Search Field */}
          <div className="relative border-b border-slate-100 px-8 py-8">
            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-primary-500" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="What can we help you find today? (Cmd+K)"
              className="w-full bg-transparent pl-12 pr-4 text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
            />
            <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <button 
                 onClick={() => setIsOpen(false)}
                 className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                 <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                    <History className="w-10 h-10" />
                 </div>
                 <p className="text-lg font-bold text-slate-400">No medical records or routes found matching "{search}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 pb-8">
                {['Navigation', 'Actions', 'Tools'].map(category => {
                  const categoryItems = filteredItems.filter(i => i.category === category);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryItems.map(item => (
                          <button
                            key={item.href}
                            onClick={() => onSelect(item.href)}
                            className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-white border border-slate-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all outline-none focus:ring-4 focus:ring-primary-500/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                <item.icon className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-black text-slate-900 leading-tight">{item.label}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-1 group-hover:text-primary-400 transition-colors">Go to Portal</p>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="px-10 py-5 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-bold leading-none">
                  <span className="mt-0.5">+</span>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">MediBook Neural Search</span>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200 text-[9px] font-black text-slate-400 uppercase">
                   <Command className="w-3 h-3" /> K
                </div>
                <span className="text-[10px] font-medium text-slate-400 italic">to navigate</span>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
