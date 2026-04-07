'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, IDoctorProfile, IUser, TimeSlot } from '@/types';
import { useState } from 'react';
import SlotPicker from '@/components/patient/SlotPicker';
import BookingModal from '@/components/patient/BookingModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  Languages, 
  ShieldCheck, 
  Stethoscope, 
  ChevronLeft,
  Info 
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ReviewList from '@/components/doctor/ReviewList';
import StarRating from '@/components/shared/StarRating';

export default function DoctorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data: doctor, isLoading, isError } = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<IDoctorProfile & { userId: IUser }>>(
        `/api/doctors/${id}`
      );
      if (!data.success) throw new Error(data.error || 'Failed to fetch doctor');
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-48 w-full bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Doctor not found</h2>
        <Button onClick={() => router.back()} variant="ghost">Go Back</Button>
      </div>
    );
  }

  const doctorUser = doctor.userId as any;

  return (
    <div className="space-y-8">
      {/* Header / Nav */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-semibold group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-1 ring-slate-100 ring-offset-4 ring-offset-slate-50">
                <AvatarImage src={doctorUser.avatar} />
                <AvatarFallback className="bg-primary-50 text-3xl font-bold text-primary-700">
                  {doctorUser.name?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl font-bold text-slate-900">Dr. {doctorUser.name}</h1>
                  {doctor.status === 'approved' && (
                    <Badge className="bg-primary-50 text-primary-700 border-none px-3 py-1 font-bold flex gap-1.5 items-center shadow-sm">
                      <ShieldCheck className="w-4 h-4 fill-primary-600/10" />
                      Verified Provider
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold">
                    <Stethoscope className="w-5 h-5 text-primary-600" />
                    {doctor.specialization}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-semibold bg-amber-50/50 px-3 py-1 rounded-xl border border-amber-100/50 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="text-amber-700 font-black">{doctor.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-slate-400 text-xs font-medium border-l border-slate-200 pl-2">({doctor.totalRatings || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-semibold">
                    <Award className="w-5 h-5 text-slate-400" />
                    {doctor.experience} Years Exp.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {doctor.languages.map(lang => (
                    <Badge key={lang} variant="outline" className="px-3 py-1 rounded-lg border-slate-200 bg-slate-50/50 text-slate-600 font-medium">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Professional Overview</h2>
            <p className="text-slate-600 leading-relaxed text-lg italic">
              "{doctor.about}"
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Clinic Location</h3>
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">{doctor.clinicName}</p>
                    <p className="text-sm text-slate-500">{doctor.address}, {doctor.city}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Qualifications</h3>
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Award className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {doctor.qualifications.map(q => (
                      <Badge key={q} className="bg-white text-slate-700 border-slate-200 font-semibold">{q}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-slate-900 border-none pb-0">Patient Reviews</h2>
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                {doctor.totalRatings || 0} Verified Feedback
              </div>
            </div>
            
            <ReviewList 
              doctorId={doctor._id} 
              averageRating={doctor.rating || 0} 
              totalReviews={doctor.totalRatings || 0} 
            />
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-8 sticky top-24">
          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl ring-1 ring-primary-500/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Book Slot</h2>
              <div className="text-right">
                <p className="text-[10px] items-center text-slate-400 uppercase tracking-widest font-bold mb-1">Fee</p>
                <p className="text-3xl font-bold text-primary-600">₹{doctor.consultationFee}</p>
              </div>
            </div>

            <SlotPicker 
              doctorId={doctor._id}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedSlot={selectedSlot}
              onSlotSelect={setSelectedSlot}
            />

            {selectedSlot && (
              <div className="mt-8 space-y-6 animate-fade-in">
                <div className="space-y-3">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary-500" />
                    Reason for visit (optional)
                  </label>
                  <Textarea 
                    placeholder="Briefly describe your symptoms..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[100px] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white resize-none"
                  />
                </div>

                <Button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg shadow-lg shadow-primary-500/25 transition-all active:scale-95"
                >
                  Confirm Appointment
                </Button>
              </div>
            )}
          </section>

          <div className="hidden lg:flex items-center gap-4 p-4 rounded-2xl bg-primary-50/30 border border-primary-100">
            <Clock className="w-10 h-10 text-primary-600 opacity-20" />
            <p className="text-xs text-primary-800 leading-relaxed font-medium">
              Average wait time at this clinic is 20 minutes. Instant confirmation available via payment.
            </p>
          </div>
        </div>
      </div>

      {selectedSlot && selectedDate && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
          doctor={doctor}
          date={selectedDate}
          slot={selectedSlot}
          reason={reason}
        />
      )}
    </div>
  );
}
