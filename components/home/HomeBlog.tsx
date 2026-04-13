'use client';

import { ArrowRight, Clock, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const posts = [
  {
    id: 1,
    title: "5 Tips to Stay Healthy in the Digital Age",
    excerpt: "Learn how to manage screen time, maintain posture, and keep your eyes healthy while working from home.",
    category: "Wellness",
    author: "Dr. Ananya Rao",
    date: "April 05, 2026",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Understanding Childhood Immunity",
    excerpt: "A comprehensive guide for parents to boost their children's natural defenses through nutrition and sleep.",
    category: "Pediatrics",
    author: "Dr. S. K. Mehta",
    date: "April 02, 2026",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
  },
  {
     id: 3,
     title: "Cardiovascular Health: What You Should Know",
     excerpt: "Exploring the daily habits that significantly impact your heart health and longevity.",
     category: "Cardiology",
     author: "Dr. Arvind Gupta",
     date: "March 28, 2026",
     image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800",
  }
];



export default function HomeBlog() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden" id="blog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.2em]">Medical Registry</h2>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
               Health Tips from <br /> Licensed Experts
            </h3>
          </div>
          <Button variant="ghost" className="rounded-xl font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 gap-2 h-12 shadow-sm border border-primary-100">
             Explore All Registry <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {posts.map((post) => (
             <article 
                key={post.id} 
                className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
             >
                <div className="relative h-64 overflow-hidden">
                   <div className="absolute top-4 left-4 z-10">
                      <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black text-primary-700 uppercase tracking-widest shadow-sm">
                         {post.category}
                      </span>
                   </div>
                   <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                       <Button className="w-full rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 border-none shadow-xl">
                          Read Strategy
                       </Button>
                   </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                   <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.date}</div>
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      <div className="flex items-center gap-1.5 text-primary-600/80"><Heart className="w-3.5 h-3.5" />Expert Care</div>
                   </div>

                   <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-700 transition-colors line-clamp-2">
                      {post.title}
                   </h4>
                   <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                   </p>

                   <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-black text-[10px]">
                         {post.author.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{post.author}</span>
                   </div>
                </div>
             </article>
           ))}
        </div>
      </div>
    </section>
  );
}
