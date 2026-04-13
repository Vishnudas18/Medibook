'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';

export default function HomeHero() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any>>('/api/admin/settings');
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-10 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight whitespace-pre-wrap">
                 {settings?.heroTitle || 'We help patients live a healthy, longer life.'}
              </h1>
              <p className="text-lg text-slate-500 max-w-xl leading-relaxed whitespace-pre-wrap">
                 {settings?.heroSubtitle || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ratione qui aspernatur culpa. Dolores fugit ea corrupti officiis consequatur!'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="h-14 px-8 rounded-full bg-primary-600 hover:bg-primary-700 text-lg font-bold shadow-xl shadow-primary-500/25 transition-all hover:-translate-y-1">
                <Link href="/register">Request an Appointment</Link>
              </Button>
              <Button asChild variant="outline" className="h-14 px-8 rounded-full border-2 border-slate-200 hover:border-primary-600 hover:text-primary-600 text-lg font-bold transition-all hover:-translate-y-1">
                <Link href="/patient/doctors">Find a Doctor</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-12 pt-4">
              <div>
                <div className="text-4xl font-extrabold text-slate-900 leading-none">30+</div>
                <div className="w-12 h-1.5 bg-accent-yellow rounded-full mt-2 mb-3" />
                <div className="text-sm font-medium text-slate-500">Years of <br />Experience</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-slate-900 leading-none">15+</div>
                <div className="w-12 h-1.5 bg-accent-purple rounded-full mt-2 mb-3" />
                <div className="text-sm font-medium text-slate-500">Clinic <br />Location</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-slate-900 leading-none">100%</div>
                <div className="w-12 h-1.5 bg-accent-teal rounded-full mt-2 mb-3" />
                <div className="text-sm font-medium text-slate-500">Patient <br />Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Visual Content (Doctor Grid) */}
          <div className="relative grid grid-cols-12 gap-4 items-start animate-fade-in delay-200">
             {/* Yellow Main Doctor */}
             <div className="col-span-8 relative">
                <div className="aspect-[4/5] rounded-[2.5rem] bg-accent-yellow overflow-hidden relative group">
                   <div className="absolute inset-0 shape-flower bg-white/20 scale-150 rotate-12 -translate-x-1/4 -translate-y-1/4 opacity-40 group-hover:rotate-45 transition-transform duration-1000" />
                   <Image 
                     src="/images/home/doctor_hero_1.png" 
                     alt="Doctor" 
                     fill
                     className="object-cover object-top"
                   />
                </div>
             </div>

             {/* Side Stack */}
             <div className="col-span-4 space-y-4 pt-12">
                {/* Purple Doctor */}
                <div className="aspect-square rounded-3xl bg-accent-purple overflow-hidden relative group">
                   <div className="absolute inset-0 shape-flower bg-white/20 scale-125 -rotate-12 translate-x-1/4 opacity-30 group-hover:rotate-12 transition-transform duration-1000" />
                   <Image 
                     src="/images/home/doctor_hero_2.png" 
                     alt="Doctor" 
                     fill
                     className="object-cover"
                   />
                </div>
                {/* Teal Doctor */}
                <div className="aspect-square rounded-3xl bg-accent-teal overflow-hidden relative group">
                   <div className="absolute inset-0 shape-flower bg-white/20 scale-125 rotate-45 -translate-y-1/4 opacity-30 group-hover:-rotate-12 transition-transform duration-1000" />
                   <Image 
                     src="/images/home/doctor_hero_3.png" 
                     alt="Doctor" 
                     fill
                     className="object-cover"
                   />
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
