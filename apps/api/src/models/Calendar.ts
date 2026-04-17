import mongoose, { Schema, Document } from 'mongoose';
import { ICalendarEntry, ITamilDate, ITithi, INakshatram, IYoga, IKarana, IMuhurtas, ISpecialDay } from '../types';

const TamilDateSchema = new Schema<ITamilDate>({
  year: { type: Number, required: true },
  yearName: { type: String, required: true },
  month: { type: String, required: true },
  day: { type: Number, required: true }
}, { _id: false });

const TithiSchema = new Schema<ITithi>({
  name: { type: String, required: true },
  number: { type: Number, required: true },
  paksha: { type: String, enum: ['Shukla', 'Krishna'], required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true }
}, { _id: false });

const NakshatramSchema = new Schema<INakshatram>({
  name: { type: String, required: true },
  lord: { type: String, required: true },
  pada: { type: Number }
}, { _id: false });

const YogaSchema = new Schema<IYoga>({
  name: { type: String },
  number: { type: Number }
}, { _id: false });

const KaranaSchema = new Schema<IKarana>({
  name: { type: String }
}, { _id: false });

const MuhurtasSchema = new Schema<IMuhurtas>({
  sunrise: { type: Date, required: true },
  sunset: { type: Date, required: true },
  moonrise: { type: Date },
  moonset: { type: Date },
  rahuKalam: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  yamagandam: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  kuligai: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  abhijit: {
    start: { type: Date },
    end: { type: Date }
  },
  brahmaMuhurta: {
    start: { type: Date },
    end: { type: Date }
  }
}, { _id: false });

const SpecialDaySchema = new Schema<ISpecialDay>({
  name: { type: String, required: true },
  nameTamil: { type: String },
  nameEnglish: { type: String },
  type: {
    type: String,
    enum: ['major', 'minor', 'regional', 'national'],
    required: true
  },
  category: { type: String },
  date: { type: Date, required: true }
}, { _id: false });

export interface ICalendarDocument extends Omit<ICalendarEntry, '_id'>, Document {}

const CalendarSchema = new Schema<ICalendarDocument>({
  date: { type: Date, required: true, unique: true },
  tamilDate: { type: TamilDateSchema, required: true },
  tithi: { type: TithiSchema, required: true },
  nakshatram: { type: NakshatramSchema, required: true },
  yoga: { type: YogaSchema },
  karana: { type: KaranaSchema },
  muhurtas: { type: MuhurtasSchema, required: true },
  specialDays: [SpecialDaySchema],
  isManualOverride: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: true },
  hasError: { type: Boolean, default: false },
  errorMessage: { type: String },
  source: {
    type: String,
    enum: ['calculated', 'scraped', 'manual'],
    default: 'calculated'
  },
  scrapedFrom: { type: String }
}, {
  timestamps: true
});

CalendarSchema.index({ date: 1 });
CalendarSchema.index({ 'tamilDate.year': 1 });
CalendarSchema.index({ 'tamilDate.month': 1 });
CalendarSchema.index({ 'tithi.number': 1 });
CalendarSchema.index({ 'nakshatram.name': 1 });
CalendarSchema.index({ isManualOverride: 1 });
CalendarSchema.index({ hasError: 1 });

export const Calendar = mongoose.model<ICalendarDocument>('Calendar', CalendarSchema);
