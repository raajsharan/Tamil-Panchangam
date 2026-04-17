import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  type: 'info' | 'warning' | 'error' | 'scrape' | 'system' | 'auth';
  message: string;
  metadata?: Record<string, unknown>;
  calendarId?: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
}

const AuditLogSchema = new Schema<IAuditLogDocument>({
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'scrape', 'system', 'auth'],
    required: true
  },
  message: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  calendarId: { type: Schema.Types.ObjectId, ref: 'Calendar' },
  adminId: { type: Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

AuditLogSchema.index({ type: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ calendarId: 1 });
AuditLogSchema.index({ adminId: 1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
