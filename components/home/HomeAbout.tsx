'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';

export default function HomeAbout() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any>>('/api/admin/settings');
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Image Side */}
          <div className="relative group">
            <div className="aspect-[4/5] rounded-[3rem] bg-accent-yellow overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 shape-flower bg-white/20 scale-150 rotate-12 opacity-30 group-hover:rotate-45 transition-transform duration-1000" />
              <Image 
                src="/images/home/doctor_about_1.png" 
                alt="Our Best Doctor" 
                fill
                className="object-cover"
              />
            </div>

            {/* Floating Info Card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 max-w-[280px] animate-fade-in delay-500">
               <div className="flex items-center gap-4 mb-4">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className={`w-2.5 h-2.5 rounded-full ${i === 1 ? 'bg-rose-400' : i === 2 ? 'bg-amber-400' : 'bg-emerald-400'}`} />)}
                  </div>
                  <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden">
                     <Image src="/images/home/doctor_hero_2.png" alt="Mini Doctor" width={48} height={48} className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">Dr. Mitchell Starc</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Chief Doctor of Nursing</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="space-y-10">
             <div className="space-y-6">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                  Proud to be one of the nations <br />
                  <span className="text-primary-600 underline decoration-accent-yellow/30 underline-offset-8">best</span>
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed whitespace-pre-wrap">
                   {settings?.aboutText || "For 30 Years in a row, U.S News & World Report has recognised us as one of the best publics hospitals in the Nation and #1 in Texas.\n\nOur Best is something we strive for each day, caring for our patients—not looking back at what we can accomplished but towards what we can do tommorow. Providing the best."}
                </p>
             </div>
             
             <Button asChild className="h-14 px-10 rounded-full bg-primary-600 hover:bg-primary-700 text-lg font-bold shadow-xl shadow-primary-500/25 transition-all hover:-translate-y-1">
                <Link href="/about">Learn More</Link>
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
