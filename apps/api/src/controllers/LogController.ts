import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendPaginated } from '../utils';
import { AuditLog } from '../models';

export class LogController {
  async getLogs(req: AuthRequest, res: Response): Promise<void> {
    const { type, page = '1', limit = '50', startDate, endDate } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = {};

    if (type && typeof type === 'string') {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (query.createdAt as Record<string, Date>).$lte = new Date(endDate as string);
      }
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('adminId', 'email')
        .populate('calendarId', 'date'),
      AuditLog.countDocuments(query)
    ]);

    sendPaginated(res, logs, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }, 'Logs retrieved');
  }

  async getLogsByType(req: AuthRequest, res: Response): Promise<void> {
    const { type } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find({ type })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('adminId', 'email'),
      AuditLog.countDocuments({ type })
    ]);

    sendPaginated(res, logs, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }, `${type} logs retrieved`);
  }

  async getRecentErrors(_req: AuthRequest, res: Response): Promise<void> {
    const logs = await AuditLog.find({ type: 'error' })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('adminId', 'email');

    sendSuccess(res, logs, 'Recent errors retrieved');
  }

  async clearOldLogs(req: AuthRequest, res: Response): Promise<void> {
    const { days = '30' } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string));

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate },
      type: { $in: ['info', 'scrape'] }
    });

    sendSuccess(res, { deleted: result.deletedCount }, `Cleared ${result.deletedCount} old logs`);
  }
}

export const logController = new LogController();
