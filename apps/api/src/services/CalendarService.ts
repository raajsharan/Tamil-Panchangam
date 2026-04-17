import { Calendar, ICalendarDocument } from '../models';
import { ICalendarEntry } from '../types';
import { logger } from '../utils';

export class CalendarService {
  async getToday(): Promise<ICalendarDocument | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Calendar.findOne({ date: today });
  }

  async getByDate(date: Date): Promise<ICalendarDocument | null> {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return Calendar.findOne({ date: normalizedDate });
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<ICalendarDocument[]> {
    return Calendar.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
  }

  async getByMonth(year: number, month: number): Promise<ICalendarDocument[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return this.getByDateRange(startDate, endDate);
  }

  async create(data: Partial<ICalendarEntry>): Promise<ICalendarDocument> {
    const entry = new Calendar(data);
    return entry.save();
  }

  async update(
    date: Date,
    data: Partial<ICalendarEntry>,
    adminId?: string
  ): Promise<ICalendarDocument | null> {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const updateData = {
      ...data,
      isManualOverride: true,
      isVerified: true
    };

    const entry = await Calendar.findOneAndUpdate(
      { date: normalizedDate },
      updateData,
      { new: true }
    );

    if (entry) {
      logger.info(`Calendar entry updated for ${normalizedDate.toISOString()} by admin ${adminId}`);
    }

    return entry;
  }

  async upsert(data: Partial<ICalendarEntry>): Promise<ICalendarDocument> {
    const entryDate = new Date(data.date!);
    entryDate.setHours(0, 0, 0, 0);

    const existing = await Calendar.findOne({ date: entryDate });

    if (existing) {
      if (existing.isManualOverride) {
        logger.info(`Skipping scraped data for ${entryDate.toISOString()} - manual override exists`);
        return existing;
      }

      Object.assign(existing, data, { isVerified: true, hasError: false });
      return existing.save();
    }

    const entry = new Calendar({
      ...data,
      date: entryDate
    });
    return entry.save();
  }

  async markError(date: Date, errorMessage: string): Promise<void> {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    await Calendar.findOneAndUpdate(
      { date: normalizedDate },
      { hasError: true, errorMessage }
    );
  }

  async getUnverified(days: number = 7): Promise<ICalendarDocument[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Calendar.find({
      isVerified: false,
      date: { $gte: cutoffDate }
    });
  }

  async getWithErrors(days: number = 7): Promise<ICalendarDocument[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Calendar.find({
      hasError: true,
      date: { $gte: cutoffDate }
    });
  }

  async search(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    entries: ICalendarDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const searchRegex = new RegExp(query, 'i');
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Calendar.find({
        $or: [
          { 'tamilDate.month': searchRegex },
          { 'tamilDate.yearName': searchRegex },
          { 'tithi.name': searchRegex },
          { 'nakshatram.name': searchRegex }
        ]
      })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Calendar.countDocuments({
        $or: [
          { 'tamilDate.month': searchRegex },
          { 'tamilDate.yearName': searchRegex },
          { 'tithi.name': searchRegex },
          { 'nakshatram.name': searchRegex }
        ]
      })
    ]);

    return {
      entries,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getStats(): Promise<{
    total: number;
    verified: number;
    unverified: number;
    withErrors: number;
    manualOverrides: number;
  }> {
    const [total, verified, unverified, withErrors, manualOverrides] = await Promise.all([
      Calendar.countDocuments(),
      Calendar.countDocuments({ isVerified: true }),
      Calendar.countDocuments({ isVerified: false }),
      Calendar.countDocuments({ hasError: true }),
      Calendar.countDocuments({ isManualOverride: true })
    ]);

    return { total, verified, unverified, withErrors, manualOverrides };
  }
}

export const calendarService = new CalendarService();
