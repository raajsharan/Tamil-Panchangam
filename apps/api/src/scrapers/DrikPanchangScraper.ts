import { BaseScraper } from './BaseScraper';
import { ICalendarEntry } from '../types';

export class DrikPanchangScraper extends BaseScraper {
  constructor() {
    super('drikpanchang');
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
        return new Date(text);
      };

      return {
        tamilDate: {
          year: parseInt(getText('.tamil-year')) || new Date().getFullYear(),
          yearName: getText('.tamil-year-name'),
          month: getText('.tamil-month'),
          day: parseInt(getText('.tamil-day')) || 1
        },
        tithi: {
          name: getText('.tithi-name'),
          number: parseInt(getText('.tithi-number')) || 1,
          paksha: (getText('.tithi-paksha') as 'Shukla' | 'Krishna') || 'Shukla',
          start: getDateTime('.tithi-start') || new Date(),
          end: getDateTime('.tithi-end') || new Date()
        },
        nakshatram: {
          name: getText('.nakshatram-name'),
          lord: getText('.nakshatram-lord')
        },
        muhurtas: {
          sunrise: getDateTime('.sunrise') || new Date(),
          sunset: getDateTime('.sunset') || new Date(),
          rahuKalam: {
            start: getDateTime('.rahu-start') || new Date(),
            end: getDateTime('.rahu-end') || new Date()
          },
          yamagandam: {
            start: getDateTime('.yamagandam-start') || new Date(),
            end: getDateTime('.yamagandam-end') || new Date()
          },
          kuligai: {
            start: getDateTime('.kuligai-start') || new Date(),
            end: getDateTime('.kuligai-end') || new Date()
          }
        }
      };
    });

    return result;
  }

  async scrapeDate(date: Date): Promise<Partial<ICalendarEntry>> {
    const dateStr = date.toISOString().split('T')[0];
    const url = `https://www.drikpanchang.com/tamil/tamil-calendar/${dateStr}.html`;
    return this.scrape(url) as Promise<Partial<ICalendarEntry>>;
  }
}
