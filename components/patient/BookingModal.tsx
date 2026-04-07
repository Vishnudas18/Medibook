'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IDoctorProfile, IUser, TimeSlot, ApiResponse } from '@/types';
import { Calendar, Clock, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: IDoctorProfile & { userId: IUser };
  date: Date;
  slot: TimeSlot;
  reason: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingModal({
  isOpen,
  onOpenChange,
  doctor,
  date,
  slot,
  reason,
}: BookingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleBooking = async () => {
    try {
      setIsProcessing(true);

      // Step 1: Create Razorpay Order
      const { data: orderRes } = await axios.post<ApiResponse<any>>('/api/payment/order', {
        doctorId: doctor._id,
        date: format(date, 'yyyy-MM-dd'),
        startTime: slot.startTime,
        reason,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.error || 'Failed to initiate booking');
      }

      const { orderId, amount, currency, key, isDummy } = orderRes.data;

      if (isDummy) {
        const { data: verifyRes } = await axios.post<ApiResponse<any>>('/api/payment/verify', {
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_dummy_${Date.now()}`,
          razorpay_signature: 'dummy_signature',
          appointmentData: {
            doctorId: doctor._id,
            date: format(date, 'yyyy-MM-dd'),
            startTime: slot.startTime,
            endTime: slot.endTime,
            reason,
          },
        });

        if (verifyRes.success) {
          toast.success('Appointment booked successfully! (Test Mode)');
          onOpenChange(false);
          router.push('/patient/appointments');
        } else {
          throw new Error(verifyRes.error || 'Test payment verification failed');
        }
        return;
      }

      // Step 2: Open Razorpay Modal
      const options = {
        key,
        amount,
        currency,
        name: 'MediBook',
        description: `Appointment with Dr. ${(doctor.userId as any).name}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Step 3: Verify Payment
            const { data: verifyRes } = await axios.post<ApiResponse<any>>('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentData: {
                doctorId: doctor._id,
                date: format(date, 'yyyy-MM-dd'),
                startTime: slot.startTime,
                endTime: slot.endTime,
                reason,
              },
            });

            if (verifyRes.success) {
              toast.success('Appointment booked successfully!');
              onOpenChange(false);
              router.push('/patient/appointments');
            } else {
              throw new Error(verifyRes.error || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            toast.error(err.response?.data?.error || err.message || 'Verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Booking error:', err);
      toast.error(err.response?.data?.error || err.message || 'Booking failed');
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="gradient-primary p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold">Confirm Booking</DialogTitle>
              <DialogDescription className="text-primary-50/80 mt-1">
                Secure your appointment with Dr. {(doctor.userId as any).name}
              </DialogDescription>
            </DialogHeader>
          </div>
          {/* Decorative background shape */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium">{format(date, 'EEEE, d MMMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium">{slot.startTime}</span>
              </div>
            </div>
            <div className="h-px bg-slate-200/50" />
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-500 text-sm">Consultation Fee</span>
              <span className="text-xl text-slate-900">₹{doctor.consultationFee}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                By clicking "Proceed to Payment", the selected slot will be locked for 5 minutes for you. If payment is not completed, it will be released.
              </p>
            </div>

            <Button
              onClick={handleBooking}
              disabled={isProcessing}
              className="w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg shadow-lg shadow-primary-500/25 transition-all active:scale-95 flex gap-3"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </>
              )}
            </Button>
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Secure 128-bit SSL encrypted payment
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
