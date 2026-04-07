'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { 
  Activity, 
  Terminal, 
  ShieldAlert, 
  CreditCard,
  UserCheck,
  AlertTriangle,
  Info,
  ServerCrash
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  auth: { label: 'Authentication', icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  payment: { label: 'Payment', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  appointment: { label: 'Appointment', icon: Activity, color: 'text-primary-600', bg: 'bg-primary-50 border-primary-100' },
  system: { label: 'System', icon: Terminal, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  error: { label: 'Error', icon: ServerCrash, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
};

const severityConfig: Record<string, { icon: any; color: string }> = {
  info: { icon: Info, color: 'text-blue-500' },
  warn: { icon: AlertTriangle, color: 'text-amber-500' },
  error: { icon: ShieldAlert, color: 'text-red-500' },
  critical: { icon: ServerCrash, color: 'text-red-700' },
};

export default function AdminLogsPage() {
  const [filterType, setFilterType] = useState('all');

  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['admin-logs', filterType],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any>>(`/api/admin/logs?type=${filterType}&limit=100`);
      if (!data.success) throw new Error(data.error || 'Failed to fetch logs');
      return data.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds for live updates
  });

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader 
          title="System Logs" 
          description="Real-time monitoring of platform activity, security events, and payments." 
        />
        
        <div className="w-full md:w-64">
           <Select value={filterType} onValueChange={setFilterType}>
             <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 shadow-sm font-medium">
               <SelectValue placeholder="Filter by type" />
             </SelectTrigger>
             <SelectContent className="rounded-xl shadow-xl border-slate-200">
               <SelectItem value="all">All Events</SelectItem>
               <SelectItem value="auth">Authentication</SelectItem>
               <SelectItem value="payment">Payments</SelectItem>
               <SelectItem value="appointment">Appointments</SelectItem>
               <SelectItem value="error">Errors</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border border-slate-200/60 shadow-md bg-white overflow-hidden">
         {/* Table Header */}
         <div className="bg-slate-50 border-b border-slate-100 p-6 hidden md:grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</div>
            <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Event Type</div>
            <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Message & Details</div>
            <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-400">User / Actor</div>
         </div>

         {/* Log Entries */}
         <div className="divide-y divide-slate-100/60 max-h-[800px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
               <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                  ))}
               </div>
            ) : isError ? (
               <div className="p-12 text-center text-red-500 font-bold flex flex-col items-center">
                  <ShieldAlert className="w-10 h-10 mb-2 opacity-50" />
                  Failed to load system logs
               </div>
            ) : logs?.length === 0 ? (
               <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                  <Terminal className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="font-bold text-lg text-slate-900">No logs found</p>
                  <p className="text-sm">There are no events matching your current filter.</p>
               </div>
            ) : (
               logs?.map((log: any) => {
                  const typeData = typeConfig[log.type] || typeConfig.system;
                  const sevData = severityConfig[log.severity] || severityConfig.info;
                  const TypeIcon = typeData.icon;
                  const SevIcon = sevData.icon;

                  return (
                     <div key={log._id} className="p-6 hover:bg-slate-50/50 transition-colors grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-4 items-start md:items-center">
                        {/* Mobile Header / Desktop Timestamp */}
                        <div className="col-span-3 flex items-center gap-3">
                           <div className="md:hidden">
                              <SevIcon className={cn("w-5 h-5", sevData.color)} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{format(new Date(log.createdAt), 'MMM d, yyyy')}</p>
                              <p className="text-[10px] font-bold text-slate-400">{format(new Date(log.createdAt), 'HH:mm:ss a')}</p>
                           </div>
                        </div>

                        {/* Type Badge */}
                        <div className="col-span-2">
                           <Badge className={cn("px-3 py-1 font-bold rounded-lg border flex items-center gap-1.5 w-fit", typeData.bg, typeData.color)}>
                              <TypeIcon className="w-3.5 h-3.5" />
                              {typeData.label}
                           </Badge>
                        </div>

                        {/* Message */}
                        <div className="col-span-4 flex gap-3 items-start">
                           <div className="hidden md:block mt-0.5">
                              <SevIcon className={cn("w-4 h-4", sevData.color)} />
                           </div>
                           <div>
                              <p className={cn("text-sm font-semibold", log.severity === 'error' || log.severity === 'critical' ? 'text-red-700' : 'text-slate-900')}>
                                 {log.message}
                              </p>
                              {log.metadata && Object.keys(log.metadata).length > 0 && (
                                 <p className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 p-1.5 rounded-md break-all">
                                    {JSON.stringify(log.metadata)}
                                 </p>
                              )}
                           </div>
                        </div>

                        {/* User */}
                        <div className="col-span-3">
                           {log.userId ? (
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                    {log.userId.name.charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">{log.userId.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{log.userId.role}</p>
                                 </div>
                              </div>
                           ) : (
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System generated</span>
                           )}
                        </div>
                     </div>
                  );
               })
            )}
         </div>
      </Card>
    </div>
  );
}
