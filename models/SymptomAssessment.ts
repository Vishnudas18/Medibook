import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISymptomAssessmentDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  symptoms: string[];
  durationDays: number;
  severity: number;
  notes?: string;
  preferredCity?: string;
  preferredLanguage?: string;
  recommendedSpecialization: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  aiSummary: string;
  createdAt: Date;
}

const SymptomAssessmentSchema = new Schema<ISymptomAssessmentDocument>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symptoms: [{ type: String, required: true }],
    durationDays: { type: Number, required: true, min: 0, max: 365 },
    severity: { type: Number, required: true, min: 1, max: 10 },
    notes: { type: String, default: '' },
    preferredCity: { type: String, default: '' },
    preferredLanguage: { type: String, default: '' },
    recommendedSpecialization: { type: String, required: true },
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    aiSummary: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

SymptomAssessmentSchema.index({ patientId: 1, createdAt: -1 });

const SymptomAssessment: Model<ISymptomAssessmentDocument> =
  mongoose.models.SymptomAssessment ||
  mongoose.model<ISymptomAssessmentDocument>('SymptomAssessment', SymptomAssessmentSchema);

export default SymptomAssessment;
