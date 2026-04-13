import { z } from 'zod';

export const triageAnalyzeSchema = z.object({
  symptoms: z.array(z.string().min(2)).default([]),
  durationDays: z.number().min(0).max(365),
  severity: z.number().min(1).max(10),
  notes: z.string().max(500).optional(),
  preferredCity: z.string().min(2).max(80).optional(),
  preferredLanguage: z.string().min(2).max(40).optional(),
}).refine(
  (value) => value.symptoms.length > 0 || Boolean(value.notes?.trim()),
  { message: 'Add at least one symptom or describe your condition in notes.' }
);

export type TriageAnalyzeInput = z.infer<typeof triageAnalyzeSchema>;
