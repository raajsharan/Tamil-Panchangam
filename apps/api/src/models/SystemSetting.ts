import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettingDocument extends Document {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
}

const SystemSettingSchema = new Schema<ISystemSettingDocument>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string'
  },
  description: { type: String }
}, { timestamps: true });

SystemSettingSchema.index({ key: 1 });

export const SystemSetting = mongoose.model<ISystemSettingDocument>('SystemSetting', SystemSettingSchema);
