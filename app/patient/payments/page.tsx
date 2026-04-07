'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IPayment, IUser } from '@/types';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientPaymentsPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['patient-payments'],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<IPayment[]>>('/api/patient/payments');
      if (!data.success) throw new Error(data.error || 'Failed to fetch payments');
      return data.data;
    },
  });

  const handleDownloadInvoice = (payment: IPayment) => {
    // In a real app, this would generate a PDF or open a pre-generated one.
    // For now, we simulate a download.
    alert(`Downloading Invoice for Order: ${payment.razorpayOrderId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Invoices</h1>
          <p className="text-slate-500 font-medium italic mt-1">Track your healthcare spending and download receipts.</p>
        </div>
        <div className="bg-primary-50 px-6 py-3 rounded-2xl border border-primary-100 flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <CreditCard className="w-5 h-5 text-primary-600" />
           </div>
           <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Total Spent</p>
              <p className="text-xl font-black text-primary-700">
                ₹{payments?.reduce((acc, curr) => curr.status === 'paid' ? acc + curr.amount : acc, 0) || 0}
              </p>
           </div>
        </div>
      </div>

      {!payments || payments.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No transactions found</h3>
          <p className="text-slate-500 mt-2 max-w-sm">Your payment history will appear here once you book your first appointment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => {
            const doctor = payment.doctorId as any;
            const doctorUser = doctor?.userId as any;
            const isPaid = payment.status === 'paid';
            
            return (
              <div 
                key={payment._id}
                className="group bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                    isPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {isPaid ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                       {doctorUser ? `Dr. ${doctorUser.name}` : 'Unknown Doctor'}
                    </h4>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                       Order ID: {payment.razorpayOrderId.slice(-10)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 max-w-2xl">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Date</p>
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                       <Calendar className="w-3.5 h-3.5 text-slate-300" />
                       {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Amount</p>
                    <p className="text-lg font-black text-slate-900">₹{payment.amount}</p>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Status</p>
                    <Badge className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                      isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                    )}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   {isPaid && (
                     <Button 
                        onClick={() => handleDownloadInvoice(payment)}
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl border-slate-100 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm group-hover:scale-105"
                        title="Download Invoice"
                     >
                        <Download className="w-5 h-5" />
                     </Button>
                   )}
                   <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-xl text-slate-400 hover:text-slate-900"
                      title="View Details"
                   >
                      <FileText className="w-5 h-5" />
                   </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
