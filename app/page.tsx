import Link from "next/link";
import HomeHero from "@/components/home/HomeHero";
import HomeAbout from "@/components/home/HomeAbout";
import HomeServices from "@/components/home/HomeServices";
import HomeVirtual from "@/components/home/HomeVirtual";
import HomeDoctors from "@/components/home/HomeDoctors";

export default function HomePage() {
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
              {['Home', 'Find a Doctor', 'Services', 'Contact'].map(item => (
                <Link 
                  key={item} 
                  href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 text-slate-900">
        <HomeHero />
        <HomeAbout />
        <HomeServices />
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
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary-400 transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary-400 transition-colors">News</Link></li>
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
