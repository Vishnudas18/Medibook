'use client';

import Link from 'next/link';
import { DoctorCardProps } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const { userId, specialization, experience, consultationFee, city, rating, totalRatings, status } = doctor;
  const user = userId as any; // Populated User object

  const isVerified = status === 'approved';

  return (
    <Card className="group overflow-hidden rounded-2xl border-slate-200 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-200 bg-white">
      <CardContent className="p-0">
        <div className="relative h-24 bg-gradient-to-br from-primary-50 to-primary-100/50 group-hover:from-primary-100 transition-colors" />
        <div className="px-6 pb-4">
          <div className="relative -mt-12 mb-4 flex items-end justify-between">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md ring-1 ring-slate-100 group-hover:ring-primary-200 transition-all">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary-50 text-2xl font-bold text-primary-700">
                {user.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-end pb-2">
              <Badge className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 font-black flex gap-1.5 items-center shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {rating > 0 ? rating.toFixed(1) : 'NEW'}
              </Badge>
              <p className="text-[9px] text-slate-400 mt-1.5 uppercase tracking-widest font-black">
                {totalRatings || 0} FEEDBACK
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors truncate">
                Dr. {user.name}
              </h3>
              {isVerified && (
                <Badge className="bg-primary-50 text-primary-700 border-primary-100 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm shrink-0">
                  <ShieldCheck className="w-3 h-3 fill-primary-600/10" />
                  <span className="text-[10px] font-black tracking-widest">VERIFIED</span>
                </Badge>
              )}
            </div>
            <p className="text-primary-600 font-semibold text-sm flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              {specialization}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Exp.</p>
                <p className="text-sm font-semibold truncate leading-none">{experience} Years</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">City</p>
                <p className="text-sm font-semibold truncate leading-none">{city}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between group-hover:bg-primary-50/30 transition-colors">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Fee</p>
          <p className="text-lg font-bold text-slate-900">₹{consultationFee}</p>
        </div>
        <Link href={`/patient/doctors/${doctor._id}`} passHref>
          <Button className="rounded-xl px-5 font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20 group/btn transition-all active:scale-95">
            Book Now
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
