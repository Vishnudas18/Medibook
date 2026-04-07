'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { SPECIALIZATIONS, LANGUAGES, CITIES } from '@/lib/utils';
import { Stethoscope, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Loader2, MapPin, Briefcase, IndianRupee, Building, GraduationCap, Camera } from 'lucide-react';

export default function DoctorRegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState({ name: '', email: '', password: '', phone: '', avatar: '' });
  const [profile, setProfile] = useState({ specialization: '', qualifications: '', experience: '', consultationFee: '', clinicName: '', city: '', address: '', about: '', languages: [] as string[] });
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => setAccount((p) => ({ ...p, [e.target.name]: e.target.value }));
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAccount(p => ({ ...p, avatar: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const toggleLanguage = (lang: string) => setProfile((p) => ({ ...p, languages: p.languages.includes(lang) ? p.languages.filter((l) => l !== lang) : [...p.languages, lang] }));

  const handleStep1 = (e: React.FormEvent) => { e.preventDefault(); setStep(2); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const userData = await registerUser({ ...account, role: 'doctor' });
      const res = await fetch('/api/doctors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: userData._id, ...profile, qualifications: profile.qualifications.split(',').map((q) => q.trim()).filter(Boolean), experience: Number(profile.experience), consultationFee: Number(profile.consultationFee) }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      router.push('/login?doctor-registered=true');
    } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="relative flex flex-col items-center justify-center w-full p-12">
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mb-8"><Stethoscope className="w-10 h-10 text-white" /></div>
          <h1 className="text-4xl font-bold text-white mb-4">For Doctors</h1>
          <p className="text-lg text-primary-100 text-center max-w-md">Join our network of trusted healthcare professionals.</p>
          <div className="mt-16 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${step >= 1 ? 'bg-white text-primary-600' : 'bg-white/20 text-white'}`}>1</div>
            <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${step >= 2 ? 'bg-white text-primary-600' : 'bg-white/20 text-white'}`}>2</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in py-8">
          <h2 className="text-3xl font-bold text-slate-900">{step === 1 ? 'Doctor Registration' : 'Professional Details'}</h2>
          <p className="mt-2 text-slate-500">{step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}</p>
          {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
          {step === 1 ? (
            <form onSubmit={handleStep1} className="mt-8 space-y-5">
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute -right-2 -bottom-2 w-8 h-8 bg-primary-600 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary-700 shadow-lg border-2 border-white transition-all active:scale-90">
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <Camera className="w-4 h-4" />
                  </label>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Profile Picture</p>
              </div>
              <div><label htmlFor="dr-name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input id="dr-name" name="name" type="text" value={account.name} onChange={handleAccountChange} placeholder="Dr. John Doe" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div></div>
              <div><label htmlFor="dr-email" className="block text-sm font-medium text-slate-700 mb-2">Email</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input id="dr-email" name="email" type="email" value={account.email} onChange={handleAccountChange} placeholder="doctor@example.com" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div></div>
              <div><label htmlFor="dr-phone" className="block text-sm font-medium text-slate-700 mb-2">Phone</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input id="dr-phone" name="phone" type="tel" value={account.phone} onChange={handleAccountChange} placeholder="+91 98765 43210" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" /></div></div>
              <div><label htmlFor="dr-password" className="block text-sm font-medium text-slate-700 mb-2">Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input id="dr-password" name="password" type={showPassword ? 'text' : 'password'} value={account.password} onChange={handleAccountChange} placeholder="Min 8 characters" required minLength={8} className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>
              <button type="submit" className="w-full py-3.5 gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">Continue to Step 2<ArrowRight className="w-5 h-5" /></button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div><label htmlFor="dr-spec" className="block text-sm font-medium text-slate-700 mb-2">Specialization</label><div className="relative"><Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><select id="dr-spec" name="specialization" value={profile.specialization} onChange={handleProfileChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"><option value="">Select specialization</option>{SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div></div>
              <div><label htmlFor="dr-qual" className="block text-sm font-medium text-slate-700 mb-2">Qualifications</label><div className="relative"><GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input id="dr-qual" name="qualifications" type="text" value={profile.qualifications} onChange={handleProfileChange} placeholder="MBBS, MD (comma-separated)" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500" /></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="dr-exp" className="block text-sm font-medium text-slate-700 mb-2">Experience (years)</label><div className="relative"><Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input id="dr-exp" name="experience" type="number" min={0} max={60} value={profile.experience} onChange={handleProfileChange} placeholder="5" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500" /></div></div>
                <div><label htmlFor="dr-fee" className="block text-sm font-medium text-slate-700 mb-2">Fee (₹)</label><div className="relative"><IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input id="dr-fee" name="consultationFee" type="number" min={100} max={10000} value={profile.consultationFee} onChange={handleProfileChange} placeholder="500" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500" /></div></div>
              </div>
              <div><label htmlFor="dr-clinic" className="block text-sm font-medium text-slate-700 mb-2">Clinic Name</label><div className="relative"><Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input id="dr-clinic" name="clinicName" type="text" value={profile.clinicName} onChange={handleProfileChange} placeholder="Apollo Health Centre" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500" /></div></div>
              <div><label htmlFor="dr-city" className="block text-sm font-medium text-slate-700 mb-2">City</label><div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><select id="dr-city" name="city" value={profile.city} onChange={handleProfileChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"><option value="">Select city</option>{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div></div>
              <div><label htmlFor="dr-address" className="block text-sm font-medium text-slate-700 mb-2">Address</label><input id="dr-address" name="address" type="text" value={profile.address} onChange={handleProfileChange} placeholder="123, MG Road" required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
              <div><label htmlFor="dr-about" className="block text-sm font-medium text-slate-700 mb-2">About</label><textarea id="dr-about" name="about" value={profile.about} onChange={handleProfileChange} placeholder="Brief description..." required minLength={20} rows={3} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-3">Languages</label><div className="flex flex-wrap gap-2">{LANGUAGES.map((lang) => (<button key={lang} type="button" onClick={() => toggleLanguage(lang)} className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${profile.languages.includes(lang) ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}`}>{lang}</button>))}</div></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all">Back</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3.5 gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</> : <>Submit<ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            </form>
          )}
          <div className="mt-8 text-center"><p className="text-sm text-slate-500">Already have an account?{' '}<Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign In</Link></p></div>
        </div>
      </div>
    </div>
  );
}
