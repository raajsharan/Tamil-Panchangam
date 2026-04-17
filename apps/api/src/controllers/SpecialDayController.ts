import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendPaginated } from '../utils';
import { SpecialDay } from '../models';

export class SpecialDayController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    const { page = '1', limit = '50', type, isActive } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, unknown> = {};

    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const [specialDays, total] = await Promise.all([
      SpecialDay.find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limitNum),
      SpecialDay.countDocuments(query)
    ]);

    sendPaginated(res, specialDays, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }, 'Special days retrieved');
  }

  async getByDate(req: AuthRequest, res: Response): Promise<void> {
    const { date } = req.params;

    if (!date) {
      res.status(400).json({
        success: false,
        error: 'Date parameter is required',
        message: 'Bad Request'
      });
      return;
    }

    const parsedDate = new Date(date);
    const nextDay = new Date(parsedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const specialDays = await SpecialDay.find({
      date: {
        $gte: parsedDate,
        $lt: nextDay
      },
      isActive: true
    });

    sendSuccess(res, specialDays, 'Special days for date retrieved');
  }

  async getUpcoming(req: AuthRequest, res: Response): Promise<void> {
    const { limit = '10' } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const specialDays = await SpecialDay.find({
      date: { $gte: today },
      isActive: true
    })
      .sort({ date: 1 })
      .limit(parseInt(limit as string));

    sendSuccess(res, specialDays, 'Upcoming special days retrieved');
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    const data = req.body;

    if (!data.name || !data.date) {
      res.status(400).json({
        success: false,
        error: 'Name and date are required',
        message: 'Bad Request'
      });
      return;
    }

    data.date = new Date(data.date);

    const specialDay = new SpecialDay(data);
    await specialDay.save();

    sendSuccess(res, specialDay, 'Special day created', 201);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const data = req.body;

    if (data.date) {
      data.date = new Date(data.date);
    }

    const specialDay = await SpecialDay.findByIdAndUpdate(id, data, { new: true });

    if (!specialDay) {
      res.status(404).json({
        success: false,
        error: 'Special day not found',
        message: 'Not Found'
      });
      return;
    }

    sendSuccess(res, specialDay, 'Special day updated');
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const specialDay = await SpecialDay.findByIdAndDelete(id);

    if (!specialDay) {
      res.status(404).json({
        success: false,
        error: 'Special day not found',
        message: 'Not Found'
      });
      return;
    }

    sendSuccess(res, null, 'Special day deleted');
  }
}

export const specialDayController = new SpecialDayController();
