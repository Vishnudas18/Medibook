'use client';

import { AppointmentCardProps, AppointmentStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MoreVertical, 
  XCircle, 
  CheckCircle2, 
  User, 
  Stethoscope, 
  ReceiptIndianRupee 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  'no-show': { label: 'No Show', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: AlertCircle },
};

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export default function AppointmentCard({
  appointment,
  userRole,
  onStatusChange,
  onCancel,
}: AppointmentCardProps) {
  const { doctorId, patientId, date, startTime, status, isPaid, reason } = appointment;
  const doctor = doctorId as any;
  const doctorUser = doctor.userId as any;
  const patient = patientId as any;

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<AppointmentStatus | null>(null);

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const canCancel = (status === 'confirmed' || status === 'pending') && userRole !== 'admin';
  const canUpdateStatus = userRole === 'doctor' || userRole === 'admin';

  return (
    <Card className="group overflow-hidden rounded-2xl border-slate-200 transition-all duration-300 hover:shadow-md bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Status Sidebar (Desktop) / Header (Mobile) */}
          <div className={cn(
            "sm:w-1.5 w-full h-2 sm:h-auto",
            status === 'confirmed' ? 'bg-blue-500' :
            status === 'completed' ? 'bg-emerald-500' :
            status === 'cancelled' ? 'bg-red-500' :
            'bg-amber-500'
          )} />

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-white ring-1 ring-slate-100 shadow-sm">
                  <AvatarImage src={userRole === 'patient' ? doctorUser.avatar : patient.avatar} />
                  <AvatarFallback className="bg-primary-50 text-xl font-bold text-primary-700">
                    {(userRole === 'patient' ? doctorUser.name : patient.name)?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    {userRole === 'patient' ? `Dr. ${doctorUser.name}` : patient.name}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                    {userRole === 'patient' ? (
                      <><Stethoscope className="w-3.5 h-3.5 text-primary-600" /> {doctor.specialization}</>
                    ) : (
                      <><User className="w-3.5 h-3.5 text-slate-400" /> Patient</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider gap-1.5 border", config.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </Badge>

                {isPaid && (
                  <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50/50 text-emerald-600 border-emerald-100">
                    Paid
                  </Badge>
                )}

                {(canCancel || canUpdateStatus) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200">
                      {canUpdateStatus && (
                        <>
                          <DropdownMenuItem onClick={() => { setTargetStatus('completed'); setIsStatusDialogOpen(true); }} className="gap-2 focus:bg-emerald-50 focus:text-emerald-700">
                            <CheckCircle2 className="w-4 h-4" /> Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setTargetStatus('no-show'); setIsStatusDialogOpen(true); }} className="gap-2">
                            <AlertCircle className="w-4 h-4" /> Mark No Show
                          </DropdownMenuItem>
                        </>
                      )}
                      {canCancel && (
                        <DropdownMenuItem onClick={() => setIsCancelDialogOpen(true)} className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600">
                          <XCircle className="w-4 h-4" /> Cancel Appointment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-slate-900">{format(new Date(date), 'PPP')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time</p>
                  <p className="text-sm font-semibold text-slate-900">{startTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {userRole === 'patient' ? doctorUser.phone : patient.phone}
                  </p>
                </div>
              </div>
            </div>

            {reason && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <ClipboardList className="w-4 h-4 text-primary-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Reason for Visit</p>
                  <p className="text-sm text-slate-600 italic font-medium leading-relaxed">"{reason}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancel Appointment?"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        onConfirm={() => {
          onCancel?.(appointment._id);
          setIsCancelDialogOpen(false);
        }}
      />

      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        title="Update Status?"
        description={`Changing status to ${targetStatus}. Confirm update?`}
        variant="primary"
        onConfirm={() => {
          if (targetStatus) onStatusChange?.(appointment._id, targetStatus);
          setIsStatusDialogOpen(false);
        }}
      />
    </Card>
  );
}

function ClipboardList(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}
