'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    title: 'Cancer Care',
    description: 'World-class care for everyone. Our health System offers unmatched, expert health care. From the lab to the clinic.',
    color: 'bg-accent-yellow',
    textColor: 'text-accent-yellow',
    id: 1,
  },
  {
    title: 'Labor & Delivery',
    description: 'World-class care for everyone. Our health System offers unmatched, expert health care. From the lab to the clinic.',
    color: 'bg-accent-purple',
    textColor: 'text-accent-purple',
    id: 2,
  },
  {
    title: 'Heart & Vascular',
    description: 'World-class care for everyone. Our health System offers unmatched, expert health care. From the lab to the clinic.',
    color: 'bg-accent-teal',
    textColor: 'text-accent-teal',
    id: 3,
  },
  {
    title: 'Mental Health',
    description: 'World-class care for everyone. Our health System offers unmatched, expert health care. From the lab to the clinic.',
    color: 'bg-accent-yellow',
    textColor: 'text-accent-yellow',
    id: 4,
  },
  {
    title: 'Neurology',
    description: 'World-class care for everyone. Our health System offers unmatched, expert health care. From the lab to the clinic.',
    color: 'bg-accent-purple',
    textColor: 'text-accent-purple',
    id: 5,
  },
  {
    title: 'Burn Treatment',
    description: 'World-class care for everyone. Our health System offers unmatched, expert health care. From the lab to the clinic.',
    color: 'bg-accent-teal',
    textColor: 'text-accent-teal',
    id: 6,
  },
];

export default function HomeServices() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Our Medical Services
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            World-class care for everyone. Our health System offers unmatched, expert health care
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, i) => (
            <div 
              key={service.title} 
              className="group p-10 bg-white rounded-[2rem] border border-transparent hover:border-slate-100 hover:shadow-2xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <h3 className="text-2xl font-extrabold text-slate-900 mb-4">{service.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                {service.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Link 
                  href={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <div className={`w-10 h-10 rounded-xl ${service.color} bg-opacity-20 flex items-center justify-center font-bold text-sm ${service.textColor}`}>
                  {service.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
