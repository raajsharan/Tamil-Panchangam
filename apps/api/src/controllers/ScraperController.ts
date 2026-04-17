import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { scraperOrchestrator, ScrapeResult } from '../scrapers';
import { scraperService } from '../services';
import { sendSuccess, sendError } from '../utils';

export class ScraperController {
  async runScrape(req: AuthRequest, res: Response): Promise<void> {
    const { startDate, endDate, daysAhead } = req.body;

    try {
      let result: ScrapeResult[];

      if (startDate && endDate) {
        result = await scraperOrchestrator.scrapeRange(
          new Date(startDate),
          new Date(endDate)
        );
      } else if (daysAhead) {
        result = await scraperOrchestrator.scrapeAll(parseInt(daysAhead));
      } else {
        const singleResult = await scraperOrchestrator.scrapeDate(new Date());
        result = [singleResult];
      }

      const successCount = result.filter((r) => r.success).length;

      sendSuccess(res, {
        total: result.length,
        successful: successCount,
        failed: result.length - successCount,
        results: result
      }, `Scraping completed. ${successCount}/${result.length} successful`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Scraping failed';
      sendError(res, message, 500, 'Scraping Error');
    }
  }

  async getStatus(_req: AuthRequest, res: Response): Promise<void> {
    const statuses = await scraperService.getAllStatuses();
    const health = await scraperService.getHealthSummary();

    sendSuccess(res, { statuses, health }, 'Scraper status retrieved');
  }

  async getSourceStatus(req: AuthRequest, res: Response): Promise<void> {
    const { source } = req.params;
    const status = await scraperService.getStatus(source);

    if (!status) {
      sendError(res, 'Scraper source not found', 404, 'Not Found');
      return;
    }

    sendSuccess(res, status, 'Source status retrieved');
  }
}

export const scraperController = new ScraperController();
