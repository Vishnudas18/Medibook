'use client';

import Link from "next/link";
import HomeHero from "@/components/home/HomeHero";
import HomeAbout from "@/components/home/HomeAbout";
import HomeServices from "@/components/home/HomeServices";
import HomeVirtual from "@/components/home/HomeVirtual";
import HomeDoctors from "@/components/home/HomeDoctors";
import HomeTestimonials from "@/components/home/HomeTestimonials";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeBlog from "@/components/home/HomeBlog";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any>>('/api/admin/settings');
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });


  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Find a Doctor', href: '/patient/doctors' },
    { label: 'Services', href: '/#services' },
    { label: 'Articles', href: '/#blog' },
    { label: 'Contact', href: '/#faq' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                <span className="text-2xl font-bold">+</span>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                Medi<span className="text-primary-600">care</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(item => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 text-sm font-bold text-slate-900 hover:text-primary-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 text-sm font-bold text-white bg-primary-600 rounded-full hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-2xl animate-fade-in">
            <div className="px-6 py-8 space-y-6">
              {navLinks.map(item => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-4 text-center text-lg font-bold text-slate-900 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-4 text-center text-lg font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20 text-slate-900">
        <HomeHero />
        <HomeAbout />
        <HomeServices />
        <HomeTestimonials />
        <HomeBlog />
        <HomeFAQ />
        <HomeVirtual />
        <HomeDoctors />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6 text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
                  +
                </div>
                <span className="text-xl font-bold text-white">
                  Medi<span className="text-primary-600">care</span>
                </span>
              </div>
              <p className="max-w-xs leading-relaxed">
                World-class care for everyone. Our health System offers unmatched, expert health care.
              </p>
            </div>
            <div className="text-left">
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Services</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-primary-400 transition-colors">Cancer Care</Link></li>
                <li><Link href="#" className="hover:text-primary-400 transition-colors">Heart & Vascular</Link></li>
                <li><Link href="#" className="hover:text-primary-400 transition-colors">Mental Health</Link></li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact Us</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href={`mailto:${settings?.contactEmail || 'support@medicare.com'}`} className="hover:text-primary-400 transition-colors">{settings?.contactEmail || 'support@medicare.com'}</a></li>
                <li><a href={`tel:${settings?.contactPhone || '+1 (555) 000-0000'}`} className="hover:text-primary-400 transition-colors">{settings?.contactPhone || '+1 (555) 000-0000'}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs">
              © {new Date().getFullYear()} Medicare. All rights reserved.
            </p>
            <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
              <Link href="#" className="hover:text-white transition-colors tracking-widest">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors tracking-widest">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
