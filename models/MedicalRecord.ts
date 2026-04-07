import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicalRecordDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  title: string;
  category: 'report' | 'prescription' | 'vaccination' | 'other';
  fileUrl: string;
  issuedBy: string;
  date: Date;
  notes: string;
  createdAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecordDocument>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['report', 'prescription', 'vaccination', 'other'],
      default: 'report',
    },
    fileUrl: { type: String, required: true },
    issuedBy: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

MedicalRecordSchema.index({ patientId: 1, category: 1 });

const MedicalRecord: Model<IMedicalRecordDocument> =
  mongoose.models.MedicalRecord ||
  mongoose.model<IMedicalRecordDocument>('MedicalRecord', MedicalRecordSchema);

export default MedicalRecord;
