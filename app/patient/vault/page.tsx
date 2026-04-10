'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import { 
  Plus, 
  FileText, 
  Search, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Activity,
  Pill,
  Syringe,
  Clipboard,
  LayoutGrid,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import VaultTimeline from '@/components/patient/VaultTimeline';

export default function DigitalHealthVaultPage() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [formData, setFormData] = useState({
    title: '',
    category: 'report',
    issuedBy: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    fileUrl: 'https://example.com/mock-file-url.pdf' // Mock file upload
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['patient-records'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<any[]>>('/api/patient/records');
      if (!data.success) throw new Error(data.error || 'Failed to fetch records');
      return data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newData: any) => {
      const { data } = await axios.post<ApiResponse<any>>('/api/patient/records', newData);
      if (!data.success) throw new Error(data.error || 'Failed to add record');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-records'] });
      setIsAddModalOpen(false);
      toast.success('Medical record added to your vault');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const filteredRecords = records?.filter(r => filter === 'all' || r.category === filter);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)}
        </div>
      </div>
    );
  }

  const categoryIcons: Record<string, any> = {
    report: Activity,
    prescription: Pill,
    vaccination: Syringe,
    other: Clipboard
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Digital Health <span className="text-primary-600">Vault</span></h1>
          <p className="text-slate-500 font-medium mt-1">Innovative, secure medical record management for your life journey.</p>
        </div>
        <div className="flex items-center gap-4">
           {/* View Mode Switcher */}
           <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all",
                  viewMode === 'grid' ? "bg-white text-primary-700 shadow-sm shadow-primary-500/10" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutGrid className="w-4 h-4" /> Grid
              </button>
              <button 
                onClick={() => setViewMode('timeline')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all",
                  viewMode === 'timeline' ? "bg-white text-primary-700 shadow-sm shadow-primary-500/10" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Timer className="w-4 h-4" /> Timeline
              </button>
           </div>

           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-14 px-8 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black shadow-lg shadow-primary-500/25 transition-all active:scale-95 gap-3">
                   <Plus className="w-5 h-5" /> Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl w-[95vw] md:w-full rounded-[2.5rem] border-slate-100 shadow-2xl p-6 sm:p-10">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-slate-900">Archive Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubmit} className="space-y-8 pt-4">
                   <div className="grid grid-cols-2 gap-6 text-left">
                      <div className="col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Record Title</label>
                         <Input 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Annual Health Check" 
                            className="h-16 rounded-2xl bg-slate-50 border-none focus:ring-primary-500/20 text-lg font-bold"
                            required
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Clinical Area</label>
                         <Select 
                            value={formData.category} 
                            onValueChange={v => setFormData({...formData, category: v})}
                         >
                            <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none font-bold">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                               <SelectItem value="report" className="font-bold">Medical Report</SelectItem>
                               <SelectItem value="prescription" className="font-bold">Prescription</SelectItem>
                               <SelectItem value="vaccination" className="font-bold">Vaccination</SelectItem>
                               <SelectItem value="other" className="font-bold">Other</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2 text-left">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Issue Date</label>
                         <Input 
                            type="date"
                            value={formData.date} 
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="h-16 rounded-2xl bg-slate-50 border-none focus:ring-primary-500/20 font-bold"
                            required
                         />
                      </div>
                      <div className="col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Healthcare Provider</label>
                         <Input 
                            value={formData.issuedBy} 
                            onChange={e => setFormData({...formData, issuedBy: e.target.value})}
                            placeholder="e.g. Mayo Clinic" 
                            className="h-16 rounded-2xl bg-slate-50 border-none focus:ring-primary-500/20 font-bold"
                         />
                      </div>
                   </div>
                   <DialogFooter className="pt-6">
                      <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-2xl h-14 px-8 font-black uppercase text-slate-400">Cancel</Button>
                      <Button type="submit" disabled={addMutation.isPending} className="rounded-2xl h-14 px-10 bg-primary-600 text-white hover:bg-primary-700 font-black uppercase shadow-lg shadow-primary-500/20">Securely Save</Button>
                   </DialogFooter>
                </form>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
               placeholder="Search by report name or hospital..." 
               className="pl-14 h-14 rounded-2xl border-none bg-slate-50/70 text-base font-medium placeholder:text-slate-300"
            />
         </div>
         <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['all', 'report', 'prescription', 'vaccination'].map((cat) => (
               <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                    filter === cat 
                       ? "bg-primary-600 text-white shadow-xl shadow-primary-500/30" 
                       : "bg-slate-50 text-slate-400 hover:bg-slate-100 font-bold"
                  )}
               >
                  {cat}
               </button>
            ))}
         </div>
      </div>

      {!filteredRecords || filteredRecords.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-32 border border-slate-100 shadow-sm flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-8 animate-pulse shadow-inner">
              <FileText className="w-12 h-12" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your vault is empty</h3>
           <p className="text-slate-500 mt-2 max-w-sm font-medium leading-relaxed">Keep your health journey organized by uploading your medical reports and prescriptions today.</p>
        </div>
      ) : (
        <>
          {viewMode === 'timeline' ? (
            <div className="bg-white/50 rounded-[3rem] border border-slate-100 shadow-inner overflow-hidden">
              <VaultTimeline records={filteredRecords as any} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {filteredRecords.map((record) => {
                const Icon = categoryIcons[record.category] || FileText;
                return (
                  <div 
                      key={record._id}
                      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
                  >
                      <div className="flex items-center justify-between mb-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          record.category === 'report' ? "bg-emerald-50 text-emerald-600" :
                          record.category === 'vaccination' ? "bg-purple-50 text-purple-600" :
                          "bg-amber-50 text-amber-600"
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                            {record.category}
                        </Badge>
                      </div>

                      <h4 className="text-lg font-black text-slate-900 group-hover:text-primary-700 transition-colors truncate">
                        {record.title}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 mt-1 truncate">
                        {record.issuedBy || 'Self Uploaded'}
                      </p>

                      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest leading-none mb-1">Uploaded On</p>
                            <p className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none">
                              {format(new Date(record.date || record.createdAt), 'MMM dd, yyyy')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 bg-slate-50/50 rounded-xl hover:bg-primary-50 hover:text-primary-600"
                              onClick={() => window.open(record.fileUrl, '_blank')}
                            >
                              <ExternalLink className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="bg-primary-600 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
               <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white tracking-tight">Bank-Grade Security</h3>
               <p className="text-primary-100 font-medium">Your medical data is encrypted and safely stored according to global standards.</p>
            </div>
         </div>
         <Button className="relative z-10 min-w-[200px] h-14 rounded-2xl bg-white text-primary-700 hover:bg-primary-50 font-black shadow-xl">
            Learn About Protection
         </Button>
      </div>
    </div>
  );
}
