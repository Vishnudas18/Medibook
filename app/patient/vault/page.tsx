'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import { 
  Plus, 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  MoreVertical,
  Activity,
  History,
  Pill,
  Syringe,
  Clipboard
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

export default function DigitalHealthVaultPage() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Digital Health Vault</h1>
          <p className="text-slate-500 font-medium mt-1">Your secure command center for all medical history and documents.</p>
        </div>
        <div className="flex items-center gap-3">
           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-14 px-8 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/25 transition-all active:scale-95 gap-2">
                   <Plus className="w-5 h-5" /> Add New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl w-[95vw] md:w-full rounded-[2rem] border-slate-100 shadow-2xl p-6 sm:p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-slate-900">Add Medical Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubmit} className="space-y-6 pt-4">
                   <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="col-span-2 space-y-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Title</label>
                         <Input 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Blood Test Report" 
                            className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-primary-500/20"
                            required
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                         <Select 
                            value={formData.category} 
                            onValueChange={v => setFormData({...formData, category: v})}
                         >
                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                               <SelectItem value="report">Report</SelectItem>
                               <SelectItem value="prescription">Prescription</SelectItem>
                               <SelectItem value="vaccination">Vaccination</SelectItem>
                               <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2 text-left">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Date</label>
                         <Input 
                            type="date"
                            value={formData.date} 
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-primary-500/20"
                            required
                         />
                      </div>
                      <div className="col-span-2 space-y-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Issued By (Hospital/Clinic)</label>
                         <Input 
                            value={formData.issuedBy} 
                            onChange={e => setFormData({...formData, issuedBy: e.target.value})}
                            placeholder="e.g. City General Hospital" 
                            className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-primary-500/20"
                         />
                      </div>
                   </div>
                   <DialogFooter className="pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-12">Cancel</Button>
                      <Button type="submit" disabled={addMutation.isPending} className="rounded-xl h-12 bg-primary-600 text-white hover:bg-primary-700 px-8">Save to Vault</Button>
                   </DialogFooter>
                </form>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
               placeholder="Search by report name or hospital..." 
               className="pl-12 h-12 rounded-2xl border-none bg-slate-50/50"
            />
         </div>
         <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['all', 'report', 'prescription', 'vaccination'].map((cat) => (
               <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                    filter === cat 
                       ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25" 
                       : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
               >
                  {cat}
               </button>
            ))}
         </div>
      </div>

      {!filteredRecords || filteredRecords.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-32 border border-slate-100 shadow-sm flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-8 animate-pulse">
              <FileText className="w-12 h-12" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your vault is empty</h3>
           <p className="text-slate-500 mt-2 max-w-sm font-medium">Keep your health journey organized by uploading your medical reports and prescriptions today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
