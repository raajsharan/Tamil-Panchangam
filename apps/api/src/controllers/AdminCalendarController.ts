import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { calendarService } from '../services';
import { sendSuccess, sendError } from '../utils';
import { AuditLog } from '../models';

export class AdminCalendarController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const { page = '1', limit = '50', startDate, endDate } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: Record<string, unknown> = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const [entries, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('adminId', 'email'),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: entries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      message: 'Calendar entries retrieved'
    });
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { date } = req.params;
    const data = req.body;

    if (!date) {
      sendError(res, 'Date parameter is required', 400, 'Bad Request');
      return;
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      sendError(res, 'Invalid date format. Use YYYY-MM-DD', 400, 'Bad Request');
      return;
    }

    const entry = await calendarService.update(parsedDate, data, req.admin?.id);

    if (!entry) {
      sendError(res, 'Calendar entry not found', 404, 'Not Found');
      return;
    }

    await AuditLog.create({
      type: 'system',
      message: `Calendar entry updated for ${date}`,
      metadata: { date, data, adminId: req.admin?.id },
      adminId: req.admin?.id
    });

    sendSuccess(res, entry, 'Calendar entry updated');
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    const data = req.body;

    if (!data.date) {
      sendError(res, 'Date is required', 400, 'Bad Request');
      return;
    }

    data.date = new Date(data.date);
    data.isManualOverride = true;
    data.source = 'manual';

    const entry = await calendarService.create(data);

    await AuditLog.create({
      type: 'system',
      message: `Calendar entry created for ${data.date}`,
      metadata: { data, adminId: req.admin?.id },
      adminId: req.admin?.id
    });

    sendSuccess(res, entry, 'Calendar entry created', 201);
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { date } = req.params;

    if (!date) {
      sendError(res, 'Date parameter is required', 400, 'Bad Request');
      return;
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const { Calendar } = await import('../models');
    const entry = await Calendar.findOneAndDelete({ date: parsedDate });

    if (!entry) {
      sendError(res, 'Calendar entry not found', 404, 'Not Found');
      return;
    }

    await AuditLog.create({
      type: 'system',
      message: `Calendar entry deleted for ${date}`,
      metadata: { date, adminId: req.admin?.id },
      adminId: req.admin?.id
    });

    sendSuccess(res, null, 'Calendar entry deleted');
  }

  async getStats(_req: AuthRequest, res: Response): Promise<void> {
    const stats = await calendarService.getStats();
    sendSuccess(res, stats, 'Stats retrieved');
  }

  async getUnverified(req: AuthRequest, res: Response): Promise<void> {
    const { days = '7' } = req.query;
    const entries = await calendarService.getUnverified(parseInt(days as string));
    sendSuccess(res, entries, 'Unverified entries retrieved');
  }

  async getWithErrors(req: AuthRequest, res: Response): Promise<void> {
    const { days = '7' } = req.query;
    const entries = await calendarService.getWithErrors(parseInt(days as string));
    sendSuccess(res, entries, 'Entries with errors retrieved');
  }
}

export const adminCalendarController = new AdminCalendarController();
