import { BaseScraper } from './BaseScraper';
import { ICalendarEntry } from '../types';

export class ProkeralaScraper extends BaseScraper {
  constructor() {
    super('prokerala');
  }

  protected async parsePage(): Promise<Partial<ICalendarEntry>> {
    if (!this.page) throw new Error('Page not initialized');

    const result = await this.page.evaluate(() => {
      const getText = (selector: string): string => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || '';
      };

      const getDateTime = (selector: string): Date | null => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const text = el.textContent?.trim() || '';
        const parsed = new Date(text);
        return isNaN(parsed.getTime()) ? null : parsed;
      };

      return {
        tithi: {
          name: getText('.tithi-name'),
          number: parseInt(getText('.tithi-number')) || 1,
          paksha: (getText('.paksha') as 'Shukla' | 'Krishna') || 'Shukla',
          start: getDateTime('.tithi-start') || new Date(),
          end: getDateTime('.tithi-end') || new Date()
        },
        nakshatram: {
          name: getText('.nakshatra-name'),
          lord: getText('.nakshatra-lord')
        },
        muhurtas: {
          sunrise: getDateTime('.sunrise-time') || new Date(),
          sunset: getDateTime('.sunset-time') || new Date()
        }
      };
    });

    return result;
  }

  async scrapeFestivals(date: Date): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');

    const url = `https://www.prokerala.com/festivals/tamil-calendar/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}.html`;

    await this.scrape(url);

    const festivals = await this.page.evaluate(() => {
      const festivalEls = document.querySelectorAll('.festival-item');
      return Array.from(festivalEls).map(el => el.textContent?.trim() || '');
    });

    return festivals;
  }
}
