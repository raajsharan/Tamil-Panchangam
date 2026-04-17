import { Router } from 'express';
import calendarRoutes from './calendar';
import authRoutes from './auth';
import adminCalendarRoutes from './adminCalendar';
import scraperRoutes from './scraper';
import logRoutes from './logs';
import specialDaysRoutes from './specialDays';

export function setupRoutes(app: Router): void {
  // Public routes
  app.use('/api/calendar', calendarRoutes);
  app.use('/api/special-days', specialDaysRoutes);

  // Auth routes
  app.use('/api/admin/auth', authRoutes);

  // Admin routes
  app.use('/api/admin/calendar', adminCalendarRoutes);
  app.use('/api/admin/scraper', scraperRoutes);
  app.use('/api/admin/logs', logRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      message: 'Tamil Calendar API is running',
      timestamp: new Date().toISOString()
    });
  });
}
