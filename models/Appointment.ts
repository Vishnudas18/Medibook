import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppointmentDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  paymentId: mongoose.Types.ObjectId;
  isPaid: boolean;
  notes: string;
  cancelReason: string;
  cancelledBy: 'patient' | 'doctor' | 'admin';
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointmentDocument>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    isPaid: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    cancelReason: { type: String, default: '' },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for queries
AppointmentSchema.index({ patientId: 1, date: -1 });
AppointmentSchema.index({ doctorId: 1, date: -1 });
AppointmentSchema.index({ doctorId: 1, date: 1, status: 1 });

const Appointment: Model<IAppointmentDocument> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);

export default Appointment;
