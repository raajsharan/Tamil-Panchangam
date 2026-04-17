import { BaseScraper } from './BaseScraper';

export class GoldenChennaiScraper extends BaseScraper {
  constructor() {
    super('goldenchennai');
  }

  protected async parsePage(): Promise<{
    tithi: string;
    specialDay?: string;
  }> {
    if (!this.page) throw new Error('Page not initialized');

    const result = await this.page.evaluate(() => {
      const getText = (selector: string): string => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || '';
      };

      return {
        tithi: getText('.tithi-name'),
        specialDay: getText('.special-day')
      };
    });

    return result;
  }

  async scrapeTithi(date: Date): Promise<{
    tithi: string;
    specialDay?: string;
  }> {
    const month = date.toLocaleString('en', { month: 'long' }).toLowerCase();
    const url = `https://calendar.goldenchennai.com/${month}-tamil-calendar/`;
    return this.scrape(url) as Promise<{
      tithi: string;
      specialDay?: string;
    }>;
  }
}
