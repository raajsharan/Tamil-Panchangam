import mongoose, { Schema, Document } from 'mongoose';

export interface IScraperStatusDocument extends Document {
  source: string;
  lastRun: Date;
  status: 'success' | 'failed' | 'partial';
  recordsProcessed: number;
  errors: string[];
  nextRun: Date;
  avgResponseTime?: number;
  successRate?: number;
}

const ScraperStatusSchema = new Schema<IScraperStatusDocument>({
  source: { type: String, required: true, unique: true },
  lastRun: { type: Date, required: true },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    required: true
  },
  recordsProcessed: { type: Number, default: 0 },
  errors: [{ type: String }],
  nextRun: { type: Date, required: true },
  avgResponseTime: { type: Number },
  successRate: { type: Number }
}, { timestamps: true });

ScraperStatusSchema.index({ status: 1 });
ScraperStatusSchema.index({ lastRun: -1 });

export const ScraperStatus = mongoose.model<IScraperStatusDocument>('ScraperStatus', ScraperStatusSchema);
