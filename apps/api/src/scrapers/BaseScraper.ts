import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '../utils';

export abstract class BaseScraper {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected source: string;

  constructor(source: string) {
    this.source = source;
  }

  protected abstract parsePage(): Promise<unknown>;

  async initialize(): Promise<void> {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });

    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  async scrape(url: string): Promise<unknown> {
    const startTime = Date.now();

    try {
      await this.initialize();

      if (!this.page) {
        throw new Error('Page not initialized');
      }

      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.page.waitForSelector('body', { timeout: 10000 });

      const data = await this.parsePage();
      const responseTime = Date.now() - startTime;

      logger.info(`${this.source} scraped successfully in ${responseTime}ms`);

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`${this.source} scraper failed: ${errorMessage}`);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  protected async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 3000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`Retry ${i + 1}/${maxRetries} failed: ${lastError.message}`);

        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}
