import { ICalendarEntry } from '../types';
import { CalendarService } from '../services';
import { scraperService } from '../services';
import { logger, validateCalendarData } from '../utils';
import { DrikPanchangScraper } from './DrikPanchangScraper';
import { ProkeralaScraper } from './ProkeralaScraper';
import { GoldenChennaiScraper } from './GoldenChennaiScraper';
import { DinamalarScraper } from './DinamalarScraper';
import { BaseScraper } from './BaseScraper';

export interface ScrapeResult {
  success: boolean;
  source: string;
  date: Date;
  data?: Partial<ICalendarEntry>;
  error?: string;
}

export class ScraperOrchestrator {
  private scrapers: Map<string, BaseScraper> = new Map();
  private calendarService: CalendarService;
  private sources: string[];

  constructor(sources: string[] = ['drikpanchang', 'prokerala', 'goldenchennai', 'dinamalar']) {
    this.calendarService = new CalendarService();
    this.sources = sources;

    this.scrapers.set('drikpanchang', new DrikPanchangScraper());
    this.scrapers.set('prokerala', new ProkeralaScraper());
    this.scrapers.set('goldenchennai', new GoldenChennaiScraper());
    this.scrapers.set('dinamalar', new DinamalarScraper());
  }

  async scrapeDate(date: Date): Promise<ScrapeResult> {
    const errors: string[] = [];
    let lastError: string = '';

    for (const source of this.sources) {
      try {
        const scraper = this.scrapers.get(source);
        if (!scraper) continue;

        const startTime = Date.now();
        let data: Partial<ICalendarEntry>;

        switch (source) {
          case 'drikpanchang':
            data = await (scraper as DrikPanchangScraper).scrapeDate(date);
            break;
          case 'prokerala':
            data = await (scraper as ProkeralaScraper).scrapeFestivals(date);
            break;
          case 'goldenchennai':
            const tithiResult = await (scraper as GoldenChennaiScraper).scrapeTithi(date);
            data = { tithi: { name: tithiResult.tithi, number: 1, paksha: 'Shukla', start: new Date(), end: new Date() } };
            break;
          case 'dinamalar':
            const calendarResult = await (scraper as DinamalarScraper).scrapeCalendar(date);
            data = {
              tamilDate: { year: date.getFullYear(), yearName: '', month: calendarResult.tamilDate.month, day: calendarResult.tamilDate.day },
              tithi: { name: calendarResult.tithi, number: 1, paksha: 'Shukla', start: new Date(), end: new Date() },
              nakshatram: { name: calendarResult.nakshatram, lord: '' }
            };
            break;
          default:
            continue;
        }

        const responseTime = Date.now() - startTime;

        const validation = validateCalendarData(data);

        if (validation.isValid && validation.data) {
          await this.calendarService.upsert({
            ...validation.data,
            date,
            source: 'scraped',
            scrapedFrom: source
          });

          await scraperService.recordSuccess(source, 1, responseTime);

          logger.info(`Successfully scraped ${date.toISOString()} from ${source}`);

          return {
            success: true,
            source,
            date,
            data: validation.data
          };
        } else {
          logger.warn(`Validation failed for ${source}: ${validation.errors.join(', ')}`);
          lastError = `Validation failed: ${validation.errors.join(', ')}`;
          errors.push(lastError);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Scraper ${source} failed for ${date.toISOString()}: ${errorMessage}`);
        errors.push(errorMessage);
        lastError = errorMessage;
        await scraperService.recordFailure(source, errorMessage);
      }
    }

    return {
      success: false,
      source: this.sources.join(', '),
      date,
      error: lastError || errors.join('; ')
    };
  }

  async scrapeRange(startDate: Date, endDate: Date): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const result = await this.scrapeDate(new Date(currentDate));
      results.push(result);

      await new Promise(resolve => setTimeout(resolve, parseInt(process.env.SCRAPER_DELAY_MS || '3000')));

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  }

  async scrapeAll(daysAhead: number = 30): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysAhead);

    for (let i = 0; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const result = await this.scrapeDate(date);
      results.push(result);

      if (i < daysAhead) {
        await new Promise(resolve => setTimeout(resolve, parseInt(process.env.SCRAPER_DELAY_MS || '3000')));
      }
    }

    return results;
  }

  async closeAll(): Promise<void> {
    for (const scraper of this.scrapers.values()) {
      await scraper.close();
    }
  }
}

export const scraperOrchestrator = new ScraperOrchestrator();
