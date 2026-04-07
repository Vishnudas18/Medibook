import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemLogDocument extends Document {
  type: 'auth' | 'payment' | 'appointment' | 'system' | 'error';
  severity: 'info' | 'warn' | 'error' | 'critical';
  message: string;
  userId?: mongoose.Types.ObjectId;
  metadata?: any;
  createdAt: Date;
}

const SystemLogSchema = new Schema<ISystemLogDocument>(
  {
    type: {
      type: String,
      enum: ['auth', 'payment', 'appointment', 'system', 'error'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warn', 'error', 'critical'],
      default: 'info',
    },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

SystemLogSchema.index({ type: 1, createdAt: -1 });
SystemLogSchema.index({ severity: 1 });

const SystemLog: Model<ISystemLogDocument> =
  mongoose.models.SystemLog ||
  mongoose.model<ISystemLogDocument>('SystemLog', SystemLogSchema);

export default SystemLog;
