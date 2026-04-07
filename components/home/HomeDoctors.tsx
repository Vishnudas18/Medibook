'use client';

import Image from 'next/image';

const doctors = [
  {
    name: 'Dr. Wayne Collins',
    specialization: 'Neurology',
    image: '/images/home/doctor_hero_1.png',
    bgColor: 'bg-accent-yellow',
  },
  {
    name: 'Dr. Mitchell Starc',
    specialization: 'Nursing',
    image: '/images/home/doctor_hero_2.png',
    bgColor: 'bg-accent-purple',
  },
  {
    name: 'Dr. Shaun Murphy',
    specialization: 'Surgery',
    image: '/images/home/doctor_hero_3.png',
    bgColor: 'bg-accent-teal',
  },
];

export default function HomeDoctors() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Our Great Doctors
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            World-class care for everyone. Our health System offers unmatched, expert health care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {doctors.map((doctor, i) => (
            <div 
              key={doctor.name} 
              className="group animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className={`aspect-square rounded-[3rem] ${doctor.bgColor} overflow-hidden relative mb-6 shadow-xl transition-transform duration-500 group-hover:-translate-y-2`}>
                 <div className="absolute inset-0 shape-flower bg-white/20 scale-150 rotate-12 opacity-30 group-hover:rotate-45 transition-transform duration-1000" />
                 <Image 
                   src={doctor.image} 
                   alt={doctor.name} 
                   fill
                   className="object-cover"
                 />
              </div>
              <div className="text-center">
                 <h3 className="text-2xl font-extrabold text-slate-900">{doctor.name}</h3>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{doctor.specialization}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
