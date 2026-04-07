import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettingsDocument extends Document {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    heroTitle: { type: String, default: 'Your Health, Our Priority' },
    heroSubtitle: { type: String, default: 'Book appointments with the best doctors in your city seamlessly.' },
    aboutText: { type: String, default: 'We are committed to providing the best healthcare experience.' },
    contactEmail: { type: String, default: 'support@medibook.com' },
    contactPhone: { type: String, default: '+1 (555) 000-0000' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

const SiteSettings: Model<ISiteSettingsDocument> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
