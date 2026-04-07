import { z } from 'zod';

export const reviewSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters long').max(500, 'Comment cannot exceed 500 characters'),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
