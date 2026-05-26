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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ApprovalRowProps {
  doctor: IDoctorProfile & { userId: IUser };
}

const STATUS_MAP = {
  pending:  { label: 'Pending',  cls: 'bg-amber-50  text-amber-600  border border-amber-200' },
  approved: { label: 'Active',   cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50    text-red-600    border border-red-200' },
} as const;

export default function ApprovalRow({ doctor }: ApprovalRowProps) {
  const queryClient = useQueryClient();
  const user = doctor.userId as any;
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen,  setIsRejectOpen]  = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ status, reason }: { status: 'approved' | 'rejected'; reason?: string }) => {
      const { data } = await axios.patch<ApiResponse<any>>(
        `/api/admin/doctors/${doctor._id}/approve`,
        { status, reason }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setIsApproveOpen(false);
      setIsRejectOpen(false);
    },
  });

  const statusStyle = STATUS_MAP[doctor.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending;

  return (
    <TableRow className="group border-slate-100 transition-colors hover:bg-slate-50/70">

      {/* Doctor Details */}
      <TableCell className="py-4 pl-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0 border border-slate-200 shadow-sm">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary-50 text-primary-700 text-sm font-bold">
              {user.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">
              Dr. {user.name}
            </p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      </TableCell>

      {/* Specialization */}
      <TableCell className="py-4">
        <div>
          <p className="text-sm font-medium text-slate-700">{doctor.specialization}</p>
          {doctor.qualifications?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {doctor.qualifications.slice(0, 2).map((q, i) => (
                <span
                  key={i}
                  className="inline-flex rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                >
                  {q}
                </span>
              ))}
            </div>
          )}
        </div>
      </TableCell>

      {/* Location */}
      <TableCell className="py-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <span className="text-sm">{doctor.city || '—'}</span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="py-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyle.cls}`}>
          {statusStyle.label}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-4 pr-6">
        <div className="flex items-center justify-end gap-2">

          {/* Details dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                id={`view-doctor-${doctor._id}`}
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <Eye className="h-3.5 w-3.5" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden rounded-2xl border-0 p-0 shadow-2xl max-w-md">
              {/* Header */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-8 py-7">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-white/20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xl font-bold text-white bg-white/10">
                      {user.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">Dr. {user.name}</DialogTitle>
                    <p className="text-sm text-slate-400">{doctor.specialization}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white px-8 py-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Experience</p>
                    <p className="text-base font-bold text-slate-800">{doctor.experience} yrs</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Fee</p>
                    <p className="text-base font-bold text-slate-800 font-mono">₹{doctor.consultationFee}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Clinic</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {doctor.clinicName}, {doctor.address}, {doctor.city}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Qualifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.qualifications.map(q => (
                      <span
                        key={q}
                        className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Approve */}
          {doctor.status !== 'approved' && (
            <Button
              id={`approve-doctor-${doctor._id}`}
              onClick={() => setIsApproveOpen(true)}
              size="sm"
              variant="outline"
              disabled={mutation.isPending}
              className="h-8 gap-1.5 rounded-lg border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Approve</span>
            </Button>
          )}

          {/* Reject */}
          {doctor.status !== 'rejected' && (
            <Button
              id={`reject-doctor-${doctor._id}`}
              onClick={() => setIsRejectOpen(true)}
              size="sm"
              variant="outline"
              disabled={mutation.isPending}
              className="h-8 gap-1.5 rounded-lg border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reject</span>
            </Button>
          )}
        </div>
      </TableCell>

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        title="Approve Doctor?"
        description={`This will verify Dr. ${user.name} and allow them to start accepting appointments. A confirmation email will be sent.`}
        variant="primary"
        confirmText="Confirm Approval"
        onConfirm={() => mutation.mutate({ status: 'approved' })}
      />
      <ConfirmDialog
        isOpen={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        title="Reject Application?"
        description="The doctor's credentials will be rejected. You can add a reason which will be included in the notification email."
        variant="destructive"
        confirmText="Confirm Rejection"
        onConfirm={() => mutation.mutate({ status: 'rejected', reason: 'Credentials verification failed.' })}
      />
    </TableRow>
  );
}
