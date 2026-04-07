'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Settings2, 
  LayoutTemplate, 
  Save, 
  RefreshCcw,
  Heading1,
  MessageSquare,
  PhoneCall,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutText: '',
    contactEmail: '',
    contactPhone: '',
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any>>('/api/admin/settings');
      if (!data.success) throw new Error(data.error || 'Failed to fetch settings');
      return data.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        aboutText: settings.aboutText || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: res } = await axios.patch<ApiResponse<any>>('/api/admin/settings', data);
      if (!res.success) throw new Error(res.error || 'Failed to update settings');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Landing page content updated successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <PageHeader title="Content Manager" description="Loading platform settings..." />
        <Skeleton className="h-[600px] w-full max-w-4xl rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader 
          title="Content Manager" 
          description="Update the copy, headlines, and contact info displayed on your public landing page." 
        />
        <Button 
           onClick={() => mutation.mutate(formData)} 
           disabled={mutation.isPending}
           className="h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 shadow-xl shadow-primary-500/20 gap-2 w-full md:w-auto"
        >
           {mutation.isPending ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
           Save Changes
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border border-slate-200/60 shadow-md bg-white max-w-4xl overflow-hidden">
         <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
            {/* Hero Section */}
            <div className="p-8 md:p-12 space-y-8">
               <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                     <LayoutTemplate className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900">Hero Section</h2>
                     <p className="text-sm text-slate-500">The first thing visitors see on the homepage</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Heading1 className="w-3.5 h-3.5" /> Main Headline
                     </label>
                     <Input 
                        name="heroTitle"
                        value={formData.heroTitle}
                        onChange={handleChange}
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-primary-500/20 px-6"
                     />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5" /> Subtitle / Banner Text
                     </label>
                     <Textarea 
                        name="heroSubtitle"
                        value={formData.heroSubtitle}
                        onChange={handleChange}
                        className="min-h-[100px] rounded-2xl bg-slate-50 border-none font-medium text-slate-700 focus:ring-primary-500/20 p-6"
                     />
                  </div>
               </div>
            </div>

            {/* About Section */}
            <div className="p-8 md:p-12 space-y-8 bg-slate-50/50">
               <div className="flex items-center gap-4 border-b border-slate-200/60 pb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                     <Settings2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900">About Platform</h2>
                     <p className="text-sm text-slate-500">Provide trust-building information to patients</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <FileText className="w-3.5 h-3.5" /> Platform Mission & Vision
                  </label>
                  <Textarea 
                     name="aboutText"
                     value={formData.aboutText}
                     onChange={handleChange}
                     className="min-h-[160px] rounded-2xl bg-white border border-slate-200 shadow-sm font-medium text-slate-700 focus:ring-blue-500/20 p-6"
                  />
               </div>
            </div>

            {/* Contact Section */}
            <div className="p-8 md:p-12 space-y-8">
               <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                     <PhoneCall className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-900">Contact Details</h2>
                     <p className="text-sm text-slate-500">How patients can reach platform support</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> Support Email
                     </label>
                     <Input 
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-emerald-500/20 px-6"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5" /> Support Phone
                     </label>
                     <Input 
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-emerald-500/20 px-6"
                     />
                  </div>
               </div>
            </div>
         </form>
      </Card>
    </div>
  );
}

function FileText(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
