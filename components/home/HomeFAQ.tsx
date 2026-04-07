'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: "How do I book an appointment?",
    answer: "Booking is simple! Log in to your Patient account, search for doctors by specialty or location, choose a preferred date and time, and confirm your slot instantly."
  },
  {
    question: "Can I cancel my appointment?",
    answer: "Yes, you can cancel appointments up to 24 hours before the scheduled time through your 'My Appointments' dashboard. A refund will be processed automatically if the payment was made online."
  },
  {
    question: "What is a 'MediBook Verified' doctor?",
    answer: "A Verified doctor has had their credentials, medical licenses, and background rigorously checked by our admin team before being allowed to list on our platform."
  },
  {
    question: "How do video consultations work?",
    answer: "Once your appointment is confirmed, you'll receive a secure video link in your dashboard. At the scheduled time, simply click the link to start your private consultation with the doctor."
  },
  {
    question: "Is my medical data secure?",
    answer: "Absolutely. We use industry-standard bank-level encryption and follow strict healthcare data privacy regulations to ensure your personal health information is always secure."
  }
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em]">Have Questions?</h2>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">
             Comprehensive FAQ
          </h3>
          <p className="text-slate-500 font-medium">
             Find answers to common questions about our platform and healthcare services.
          </p>
        </div>

        <div className="space-y-4">
           {faqs.map((faq, idx) => {
             const isOpen = openIndex === idx;
             return (
               <div 
                  key={idx} 
                  className={cn(
                    "rounded-2xl border transition-all duration-300",
                    isOpen ? "bg-primary-50/30 border-primary-100 shadow-sm" : "border-slate-100 bg-white"
                  )}
               >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                       <HelpCircle className={cn("w-5 h-5", isOpen ? "text-primary-600" : "text-slate-400")} />
                       <span className={cn("font-bold text-lg", isOpen ? "text-slate-900" : "text-slate-700")}>
                          {faq.question}
                       </span>
                    </div>
                    <ChevronDown className={cn(
                       "w-5 h-5 text-slate-400 transition-transform duration-300",
                       isOpen && "rotate-180 text-primary-600"
                    )} />
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed font-medium">
                       {faq.answer}
                    </div>
                  </div>
               </div>
             );
           })}
        </div>
      </div>
    </section>
  );
}
