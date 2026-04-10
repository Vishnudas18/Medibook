'use client';

import { format } from 'date-fns';
import { 
  Activity, 
  Pill, 
  Syringe, 
  Clipboard, 
  FileText,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TimelineRecord {
  _id: string;
  title: string;
  category: 'report' | 'prescription' | 'vaccination' | 'other' | 'appointment';
  date: string;
  issuedBy?: string;
  fileUrl?: string;
  notes?: string;
}

interface VaultTimelineProps {
  records: TimelineRecord[];
}

export default function VaultTimeline({ records }: VaultTimelineProps) {
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
    report: { icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    prescription: { icon: Pill, color: 'text-amber-600', bg: 'bg-amber-50' },
    vaccination: { icon: Syringe, color: 'text-purple-600', bg: 'bg-purple-50' },
    appointment: { icon: Stethoscope, color: 'text-primary-600', bg: 'bg-primary-50' },
    other: { icon: Clipboard, color: 'text-slate-600', bg: 'bg-slate-50' },
  };

  return (
    <div className="relative px-4 sm:px-8 py-12">
      {/* Central Axis */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 hidden md:block" />

      <div className="space-y-24 relative">
        {sortedRecords.map((record, index) => {
          const config = categoryConfig[record.category] || categoryConfig.other;
          const isEven = index % 2 === 0;

          return (
            <div key={record._id} className={cn(
              "relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0",
              isEven ? "md:flex-row-reverse" : ""
            )}>
              {/* Central Pillar Icon */}
              <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center z-10">
                <div className={cn(
                  "w-14 h-14 rounded-3xl bg-white border-2 border-slate-50 flex items-center justify-center shadow-xl transition-transform hover:scale-110",
                  config.color
                )}>
                  <config.icon className="w-7 h-7" />
                </div>
              </div>

              {/* Content Card */}
              <div className="w-full md:w-[45%] group">
                <div className={cn(
                  "bg-white p-8 rounded-[2.5rem] border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:border-primary-100 relative overflow-hidden",
                  isEven ? "md:mr-12" : "md:ml-12"
                )}>
                  {/* Abstract Background */}
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity",
                    config.bg
                   )} />

                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          {format(new Date(record.date), 'MMMM dd, yyyy')}
                       </p>
                       <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", config.bg, config.color)}>
                          {record.category}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary-700 transition-colors">
                          {record.title}
                       </h3>
                       <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          {record.issuedBy || 'Clinical Record'}
                       </p>
                    </div>

                    {record.notes && (
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                        "{record.notes}"
                      </p>
                    )}

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault Secured</span>
                       </div>
                       
                       {record.fileUrl && (
                         <Button 
                           variant="ghost" 
                           onClick={() => window.open(record.fileUrl, '_blank')}
                           className="h-10 px-5 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-600 transition-all text-xs font-bold gap-2"
                         >
                           <ExternalLink className="w-4 h-4" /> View Source
                         </Button>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Marker (Mobile Only) */}
              <div className="md:hidden flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-50 border border-slate-100">
                 <Clock className="w-4 h-4 text-slate-400" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {format(new Date(record.date), 'MMM yyyy')}
                 </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start/End Indicators */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
         <div className="w-10 h-10 rounded-full border-2 border-slate-50 bg-white flex items-center justify-center text-slate-200">
            <Heart className="w-5 h-5 fill-current" />
         </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 hidden md:block">
         <div className="w-10 h-10 rounded-full border-2 border-slate-50 bg-white flex items-center justify-center text-slate-200">
            <Activity className="w-5 h-5" />
         </div>
      </div>
    </div>
  );
}
