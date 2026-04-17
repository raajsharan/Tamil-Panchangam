import { BaseScraper } from './BaseScraper';

export class DinamalarScraper extends BaseScraper {
  constructor() {
    super('dinamalar');
  }

  protected async parsePage(): Promise<{
    tamilDate: {
      month: string;
      day: number;
    };
    tithi: string;
    nakshatram: string;
  }> {
    if (!this.page) throw new Error('Page not initialized');

    const result = await this.page.evaluate(() => {
      const getText = (selector: string): string => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || '';
      };

      return {
        tamilDate: {
          month: getText('.tamil-month-name'),
          day: parseInt(getText('.tamil-day-num')) || 1
        },
        tithi: getText('.tithi-name'),
        nakshatram: getText('.nakshatra-name')
      };
    });

    return result;
  }

  async scrapeCalendar(date: Date): Promise<{
    tamilDate: { month: string; day: number };
    tithi: string;
    nakshatram: string;
  }> {
    const url = `https://www.dinamalar.com/dailycalendar/${date.getDate()}`;
    return this.scrape(url) as Promise<{
      tamilDate: { month: string; day: number };
      tithi: string;
      nakshatram: string;
    }>;
  }
}
