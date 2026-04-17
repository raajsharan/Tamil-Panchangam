import mongoose, { Schema, Document } from 'mongoose';

export interface ITelegramSubscriberDocument extends Document {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  language: 'en' | 'ta';
  subscribed: boolean;
  notificationsEnabled: boolean;
  lastInteraction: Date;
  preferences?: Record<string, unknown>;
}

const TelegramSubscriberSchema = new Schema<ITelegramSubscriberDocument>({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  language: { type: String, enum: ['en', 'ta'], default: 'en' },
  subscribed: { type: Boolean, default: true },
  notificationsEnabled: { type: Boolean, default: true },
  lastInteraction: { type: Date, default: Date.now },
  preferences: { type: Schema.Types.Mixed }
}, { timestamps: true });

TelegramSubscriberSchema.index({ telegramId: 1 });
TelegramSubscriberSchema.index({ subscribed: 1 });

export const TelegramSubscriber = mongoose.model<ITelegramSubscriberDocument>('TelegramSubscriber', TelegramSubscriberSchema);
