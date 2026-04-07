import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface IPrescriptionDocument extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  medicines: IMedicine[];
  advice: string;
  nextFollowUp: Date;
  createdAt: Date;
}

const MedicineSchema = new Schema<IMedicine>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: '' },
});

const PrescriptionSchema = new Schema<IPrescriptionDocument>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
    },
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
    medicines: [MedicineSchema],
    advice: { type: String, default: '' },
    nextFollowUp: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PrescriptionSchema.index({ appointmentId: 1 });
PrescriptionSchema.index({ patientId: 1 });

const Prescription: Model<IPrescriptionDocument> =
  mongoose.models.Prescription ||
  mongoose.model<IPrescriptionDocument>('Prescription', PrescriptionSchema);

export default Prescription;
