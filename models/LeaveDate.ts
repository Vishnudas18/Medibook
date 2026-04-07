import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveDateDocument extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  reason: string;
  createdAt: Date;
}

const LeaveDateSchema = new Schema<ILeaveDateDocument>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index: one leave per doctor per date
LeaveDateSchema.index({ doctorId: 1, date: 1 }, { unique: true });

const LeaveDate: Model<ILeaveDateDocument> =
  mongoose.models.LeaveDate ||
  mongoose.model<ILeaveDateDocument>('LeaveDate', LeaveDateSchema);

export default LeaveDate;
