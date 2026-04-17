import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { calendarService } from '../services';
import { sendSuccess, sendPaginated } from '../utils';

export class CalendarController {
  async getToday(_req: AuthRequest, res: Response): Promise<void> {
    const entry = await calendarService.getToday();

    if (!entry) {
      res.status(404).json({
        success: false,
        error: 'No calendar data available for today',
        message: 'Not Found'
      });
      return;
    }

    sendSuccess(res, entry, 'Today\'s calendar data retrieved');
  }

  async getByDate(req: AuthRequest, res: Response): Promise<void> {
    const { date } = req.params;

    if (!date) {
      res.status(400).json({
        success: false,
        error: 'Date parameter is required (YYYY-MM-DD format)',
        message: 'Bad Request'
      });
      return;
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD',
        message: 'Bad Request'
      });
      return;
    }

    const entry = await calendarService.getByDate(parsedDate);

    if (!entry) {
      res.status(404).json({
        success: false,
        error: 'No calendar data found for the specified date',
        message: 'Not Found'
      });
      return;
    }

    sendSuccess(res, entry, 'Calendar data retrieved');
  }

  async getByMonth(req: AuthRequest, res: Response): Promise<void> {
    const { year, month } = req.params;

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      res.status(400).json({
        success: false,
        error: 'Invalid year or month. Month should be 1-12',
        message: 'Bad Request'
      });
      return;
    }

    const entries = await calendarService.getByMonth(yearNum, monthNum);
    sendSuccess(res, entries, `Calendar data for ${year}-${month} retrieved`);
  }

  async getByDateRange(req: AuthRequest, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required',
        message: 'Bad Request'
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD',
        message: 'Bad Request'
      });
      return;
    }

    if (start > end) {
      res.status(400).json({
        success: false,
        error: 'startDate must be before endDate',
        message: 'Bad Request'
      });
      return;
    }

    const entries = await calendarService.getByDateRange(start, end);
    sendSuccess(res, entries, 'Calendar data range retrieved');
  }

  async search(req: AuthRequest, res: Response): Promise<void> {
    const { q, page = '1', limit = '20' } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Search query (q) is required',
        message: 'Bad Request'
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await calendarService.search(q, pageNum, limitNum);

    sendPaginated(res, result.entries, {
      page: result.page,
      limit: limitNum,
      total: result.total,
      totalPages: result.totalPages
    }, 'Search completed');
  }
}

export const calendarController = new CalendarController();
