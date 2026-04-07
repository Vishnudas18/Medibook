'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomeVirtual() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Text Content */}
          <div className="space-y-10 order-2 lg:order-1">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                Get Virtual Treatment <br />
                anytime.
              </h2>
              <ul className="space-y-6">
                {[
                  'Schedule the appointment directly.',
                  'Search for your physician here, and contact their office.',
                  'View our physicians who are accepting new patients, use the online scheduling tool to select an appointment time.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold mt-1 group-hover:bg-primary-600 transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-slate-500 text-lg leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button asChild className="h-14 px-10 rounded-full bg-primary-600 hover:bg-primary-700 text-lg font-bold shadow-xl shadow-primary-500/25 transition-all hover:-translate-y-1">
              <Link href="/services">Learn More</Link>
            </Button>
          </div>

          {/* Visual Side */}
          <div className="relative order-1 lg:order-2 animate-fade-in">
            <div className="aspect-square rounded-[3rem] bg-accent-purple overflow-hidden relative shadow-2xl">
               <div className="absolute inset-0 shape-flower bg-white/20 scale-150 rotate-45 opacity-30 group-hover:rotate-90 transition-transform duration-1000" />
               <Image 
                 src="/images/home/doctor_virtual_1.png" 
                 alt="Virtual Treatment" 
                 fill
                 className="object-cover"
               />
            </div>

            {/* Floating Video Call UI */}
            <div className="absolute top-1/2 -left-12 -translate-y-1/2 bg-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 animate-slide-in-right delay-700">
               <div className="flex items-center justify-between gap-8 mb-4">
                  <div className="text-xs font-bold text-slate-400">Tue, 24 <span className="ml-2">10:00AM</span></div>
                  <div className="w-10 h-10 rounded-xl bg-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-400/20">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  </div>
               </div>
               <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-extrabold uppercase tracking-wider mb-3">
                  Consultation
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                     <Image src="/images/home/doctor_hero_1.png" alt="Doctor" width={40} height={40} className="object-cover" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">Wayne Collins</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
