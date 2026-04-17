import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecialDayDocument extends Document {
  name: string;
  nameTamil?: string;
  nameEnglish?: string;
  type: 'major' | 'minor' | 'regional' | 'national';
  category?: string;
  date: Date;
  description?: string;
  descriptionTamil?: string;
  isActive: boolean;
  isRecurring: boolean;
  tamilMonth?: string;
  tamilDay?: number;
  tithi?: string;
  nakshatram?: string;
}

const SpecialDaySchema = new Schema<ISpecialDayDocument>({
  name: { type: String, required: true },
  nameTamil: { type: String },
  nameEnglish: { type: String },
  type: {
    type: String,
    enum: ['major', 'minor', 'regional', 'national'],
    required: true
  },
  category: { type: String },
  date: { type: Date, required: true },
  description: { type: String },
  descriptionTamil: { type: String },
  isActive: { type: Boolean, default: true },
  isRecurring: { type: Boolean, default: true },
  tamilMonth: { type: String },
  tamilDay: { type: Number },
  tithi: { type: String },
  nakshatram: { type: String }
}, { timestamps: true });

SpecialDaySchema.index({ date: 1 });
SpecialDaySchema.index({ type: 1 });
SpecialDaySchema.index({ isActive: 1 });
SpecialDaySchema.index({ tamilMonth: 1 });

export const SpecialDay = mongoose.model<ISpecialDayDocument>('SpecialDay', SpecialDaySchema);
