'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/shared/StarRating';
import { cn } from '@/lib/utils';
import { Stethoscope, CheckCircle, Info } from 'lucide-react';

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  doctorName: string;
}

export default function ReviewDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  doctorName,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (rating === 0) throw new Error('Please select a rating');
      const { data } = await axios.post('/api/reviews', {
        appointmentId,
        rating,
        comment,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Your feedback has been submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onOpenChange(false);
      setRating(0);
      setComment('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.message || 'Failed to submit review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const doctorCleanName = doctorName.replace(/^Dr\.?\s+/i, '');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header Section */}
          <div className="p-6 border-b border-slate-100">
            <DialogHeader className="p-0 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-primary-600" />
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                  Leave Feedback
                </DialogTitle>
              </div>
              <DialogDescription className="text-slate-500 font-medium pl-10 text-sm">
                How was your consultation with <span className="text-slate-900 font-semibold">Dr. {doctorCleanName}</span>?
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            {/* Rating Section */}
            <div className="space-y-4 text-center sm:text-left">
              <div className="flex items-center justify-between mb-2">
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Rating</p>
                 {rating > 0 && (
                   <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-right-2">
                     <CheckCircle className="w-3.5 h-3.5" />
                     {rating} / 5 Selected
                   </span>
                 )}
              </div>
              <div className="flex justify-center sm:justify-start bg-slate-50/50 p-6 rounded-xl border border-slate-100 items-center">
                <StarRating 
                  rating={rating} 
                  onRatingChange={setRating} 
                  size={32} 
                  className="gap-2"
                />
              </div>
            </div>

            {/* Comment Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience Details</p>
                <p className={cn(
                  "text-[10px] font-medium transition-colors",
                  comment.length > 450 ? "text-red-500 font-bold" : "text-slate-400"
                )}>
                  {comment.length} / 500
                </p>
              </div>
              <Textarea
                placeholder="Briefly describe the care you received, the doctor's professionalism, and any other relevant details."
                className="min-h-[140px] rounded-xl border-slate-200 bg-white p-4 text-slate-700 text-sm font-medium leading-relaxed focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all resize-none shadow-sm"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <div className="flex items-start gap-2 bg-primary-50/50 p-3 rounded-lg border border-primary-100/50">
                 <Info className="w-3.5 h-3.5 text-primary-500 mt-0.5 flex-shrink-0" />
                 <p className="text-[10px] text-primary-700 leading-normal font-medium">
                    Please keep your feedback helpful and professional. Your review helps others make informed choices.
                 </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-xl">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="px-6 font-bold text-slate-500 hover:bg-slate-200 h-10 text-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="px-8 font-bold bg-primary-600 hover:bg-primary-700 text-white h-10 text-sm shadow-md shadow-primary-600/10 active:scale-95 transition-all"
              disabled={mutation.isPending || rating === 0 || comment.length < 5}
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
