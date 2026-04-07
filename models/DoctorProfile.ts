import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDoctorProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  clinicName: string;
  city: string;
  address: string;
  about: string;
  languages: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string;
  rating: number;
  totalRatings: number;
  documents: string[];
  createdAt: Date;
}

const DoctorProfileSchema = new Schema<IDoctorProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true },
    qualifications: [{ type: String }],
    experience: { type: Number, required: true, min: 0 },
    consultationFee: { type: Number, required: true, min: 0 },
    clinicName: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    about: { type: String, required: true },
    languages: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    documents: [{ type: String }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for search
DoctorProfileSchema.index({ specialization: 1, city: 1, status: 1 });
DoctorProfileSchema.index({ userId: 1 });

const DoctorProfile: Model<IDoctorProfileDocument> =
  mongoose.models.DoctorProfile ||
  mongoose.model<IDoctorProfileDocument>('DoctorProfile', DoctorProfileSchema);

export default DoctorProfile;
