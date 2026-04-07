'use client';

import { useState } from 'react';
import { IDoctorProfile, IUser, ApiResponse } from '@/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MapPin, 
  Award, 
  ExternalLink,
  ClipboardCheck,
  ShieldAlert
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ApprovalRowProps {
  doctor: IDoctorProfile & { userId: IUser };
}

export default function ApprovalRow({ doctor }: ApprovalRowProps) {
  const queryClient = useQueryClient();
  const user = doctor.userId as any;
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ status, reason }: { status: 'approved' | 'rejected', reason?: string }) => {
      const { data } = await axios.patch<ApiResponse<any>>(`/api/admin/doctors/${doctor._id}/approve`, {
        status,
        reason,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setIsApproveDialogOpen(false);
      setIsRejectDialogOpen(false);
    },
  });

  return (
    <TableRow className="group transition-all hover:bg-slate-50/50">
      <TableCell className="py-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-slate-100 shadow-sm">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary-50 text-primary-700 font-bold">
              {user.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">Dr. {user.name}</p>
            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-slate-700">{doctor.specialization}</p>
          <div className="flex flex-wrap gap-1">
             {doctor.qualifications.slice(0, 2).map((q, i) => (
                <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 border-slate-200 bg-white text-slate-500">{q}</Badge>
             ))}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm">{doctor.city}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge 
          className={cn(
            "rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-wider",
            doctor.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
            doctor.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            'bg-red-50 text-red-600 border-red-100'
          )}
        >
          {doctor.status}
        </Badge>
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-3 flex-wrap">
          {/* Always show Details for transparency */}
          <Dialog>
             <DialogTrigger asChild>
               <Button variant="ghost" size="sm" className="h-9 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 font-bold">
                 <Eye className="w-4 h-4 mr-2" /> Details
               </Button>
             </DialogTrigger>
             <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden max-w-[500px]">
                <div className="bg-slate-900 p-8 text-white">
                   <div className="flex items-center gap-4 mb-6">
                     <Avatar className="h-16 w-16 border-2 border-white/20">
                       <AvatarImage src={user.avatar} />
                       <AvatarFallback className="text-2xl font-bold">{user.name?.[0]}</AvatarFallback>
                     </Avatar>
                     <div>
                       <DialogTitle className="text-2xl font-bold font-heading">Dr. {user.name}</DialogTitle>
                       <p className="text-slate-400">{doctor.specialization}</p>
                     </div>
                   </div>
                </div>
                <div className="p-8 space-y-6 bg-white">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Experience</p>
                         <p className="font-bold text-slate-800">{doctor.experience} Years</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Consultation Fee</p>
                         <p className="font-bold text-slate-800 font-mono">₹{doctor.consultationFee}</p>
                      </div>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Clinic Address</p>
                     <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                       {doctor.clinicName}, {doctor.address}, {doctor.city}
                     </p>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Qualifications</p>
                     <div className="flex flex-wrap gap-2">
                       {doctor.qualifications.map(q => <Badge key={q} variant="secondary" className="rounded-lg">{q}</Badge>)}
                     </div>
                   </div>
                </div>
             </DialogContent>
          </Dialog>

          {/* Contextual Approval Actions */}
          <div className="flex items-center gap-2">
            {doctor.status !== 'approved' && (
              <Button 
                onClick={() => setIsApproveDialogOpen(true)}
                variant="outline" 
                size="sm" 
                className="h-9 rounded-xl border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 md:mr-2" /> 
                <span className="hidden md:inline">Approve</span>
              </Button>
            )}
            
            {doctor.status !== 'rejected' && (
              <Button 
                onClick={() => setIsRejectDialogOpen(true)}
                variant="outline" 
                size="sm" 
                className="h-9 rounded-xl border-red-100 bg-red-50 text-red-700 hover:bg-red-100 font-bold"
              >
                <XCircle className="w-4 h-4 md:mr-2" /> 
                <span className="hidden md:inline">Reject</span>
              </Button>
            )}
          </div>
        </div>
      </TableCell>

      <ConfirmDialog
        isOpen={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        title="Approve Representative?"
        description={`This will verify Dr. ${user.name} and allow them to start accepting appointments. An email will be sent.`}
        variant="primary"
        confirmText="Confirm Approval"
        onConfirm={() => mutation.mutate({ status: 'approved' })}
      />

      <ConfirmDialog
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        title="Reject Credentials?"
        description="Please provide a reason if you wish, this will be sent to the doctor. They can re-register later."
        variant="destructive"
        confirmText="Confirm Rejection"
        onConfirm={() => mutation.mutate({ status: 'rejected', reason: 'Credentials verification failed.' })}
      />
    </TableRow>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
