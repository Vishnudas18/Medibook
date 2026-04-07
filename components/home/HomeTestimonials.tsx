'use client';

import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Patient',
    content: 'Booking an appointment was so easy and the doctor I found was incredible. MediBook has completely changed how I manage my healthcare.',
    rating: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Patient',
    content: 'The video consultation feature is a lifesaver. I could speak with a top specialist from the comfort of my home within minutes.',
    rating: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  },
  {
    id: 3,
    name: 'Emily Williams',
    role: 'Patient',
    content: 'I love that I can read verified reviews from other patients before booking. It gave me so much confidence in my choice.',
    rating: 5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  }
];

export default function HomeTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em]">Patient Stories</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
             Trusted by Thousands
          </h3>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
             Discover how MediBook is helping patients find better care and live healthier lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {testimonials.map((t, idx) => (
             <div 
                key={t.id} 
                className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative"
             >
                <div className="absolute top-8 right-10 text-primary-600/10 group-hover:text-primary-600/20 transition-colors">
                   <Quote className="w-16 h-16" />
                </div>

                <div className="flex gap-1 mb-6">
                   {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                   ))}
                </div>

                <p className="text-slate-600 font-medium leading-relaxed italic mb-8 relative">
                   "{t.content}"
                </p>

                <div className="flex items-center gap-4">
                   <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-2xl bg-slate-100 object-cover"
                   />
                   <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.role}</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
