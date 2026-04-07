import { z } from 'zod';

export const doctorProfileSchema = z.object({
  specialization: z.string().min(2, 'Specialization is required'),
  qualifications: z
    .array(z.string().min(1))
    .min(1, 'At least one qualification is required'),
  experience: z
    .number()
    .min(0, 'Experience must be a positive number')
    .max(60, 'Experience seems too high'),
  consultationFee: z
    .number()
    .min(100, 'Minimum consultation fee is ₹100')
    .max(10000, 'Maximum consultation fee is ₹10,000'),
  clinicName: z.string().min(2, 'Clinic name is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  about: z
    .string()
    .min(20, 'About section must be at least 20 characters')
    .max(1000, 'About section must be at most 1000 characters'),
  languages: z
    .array(z.string().min(1))
    .min(1, 'At least one language is required'),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  slotDuration: z.number().min(10).max(120),
  isActive: z.boolean(),
});

export const leaveSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(200),
});

export const updateDoctorProfileSchema = doctorProfileSchema.partial();

export type DoctorProfileInput = z.infer<typeof doctorProfileSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type LeaveInput = z.infer<typeof leaveSchema>;
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>;
