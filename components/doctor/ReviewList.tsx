'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';
import StarRating from '@/components/shared/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MessageSquare, Star, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
  _id: string;
  patientId: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewListProps {
  doctorId: string;
  averageRating: number;
  totalReviews: number;
}

export default function ReviewList({ doctorId, averageRating, totalReviews }: ReviewListProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', doctorId],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<Review[]>>(`/api/doctors/${doctorId}/reviews`);
      if (!data.success) throw new Error(data.error || 'Failed to fetch reviews');
      return data.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Ratings Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
         <div className="flex flex-col items-center justify-center border-r border-white/10 md:pr-6">
            <h4 className="text-5xl font-black mb-2">{averageRating.toFixed(1)}</h4>
            <StarRating rating={Math.round(averageRating)} size={22} className="mb-2" />
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Average Rating</p>
         </div>
         <div className="flex flex-col items-center justify-center border-r border-white/10 md:px-6">
            <h4 className="text-4xl font-bold mb-2 flex items-center gap-3">
               <Users className="w-8 h-8 text-primary-400" /> {totalReviews}
            </h4>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Total Reviews</p>
         </div>
         <div className="flex flex-col items-center justify-center md:pl-6">
            <h4 className="text-4xl font-bold mb-2 flex items-center gap-3">
               <MessageSquare className="w-8 h-8 text-emerald-400" /> {reviews?.length || 0}
            </h4>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Verified Comments</p>
         </div>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review._id} 
              className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-slate-100">
                    <AvatarImage src={review.patientId.avatar} />
                    <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                       {review.patientId.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h5 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                       {review.patientId.name}
                    </h5>
                    <p className="text-xs text-slate-400 font-medium">
                       {format(new Date(review.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 flex items-center gap-1.5 shadow-sm">
                   <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                   <span className="text-sm font-black text-amber-700">{review.rating}</span>
                </div>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed italic pl-16">
                 "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
           <Star className="w-16 h-16 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-500 font-bold text-lg">No reviews yet for this doctor.</p>
           <p className="text-slate-400 text-sm">Be the first to share your experience!</p>
        </div>
      )}
    </div>
  );
}
