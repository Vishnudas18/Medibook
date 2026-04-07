import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAvailabilityDocument extends Document {
  doctorId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

const AvailabilitySchema = new Schema<IAvailabilityDocument>({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
  },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  slotDuration: { type: Number, required: true, min: 10, max: 120 },
  isActive: { type: Boolean, default: true },
});

// Compound index: one schedule per doctor per day
AvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

const Availability: Model<IAvailabilityDocument> =
  mongoose.models.Availability ||
  mongoose.model<IAvailabilityDocument>('Availability', AvailabilitySchema);

export default Availability;
