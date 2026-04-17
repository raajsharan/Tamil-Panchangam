import cron from 'node-cron';
import { scraperOrchestrator } from '../scrapers';
import { logger } from '../utils';
import { telegramBot } from './TelegramBot';

export class Scheduler {
  private isRunning: boolean = false;

  start(): void {
    this.scheduleScraping();
    this.scheduleTelegramPost();
    logger.info('Scheduler started');
  }

  private scheduleScraping(): void {
    // Run at 4:30 AM IST (which is 11:00 PM UTC)
    cron.schedule('0 23 * * *', async () => {
      if (this.isRunning) {
        logger.warn('Scraping job skipped - previous job still running');
        return;
      }

      this.isRunning = true;
      logger.info('Starting scheduled scraping job');

      try {
        const result = await scraperOrchestrator.scrapeAll(7);
        const successCount = result.filter(r => r.success).length;

        logger.info(`Scheduled scraping completed: ${successCount}/${result.length} successful`);

        const adminChatId = parseInt(process.env.ADMIN_CHAT_ID || '0');
        if (adminChatId) {
          await telegramBot.sendMessage(
            adminChatId,
            `🔄 *Scheduled Scrape Complete*\n\n` +
            `✅ Successful: ${successCount}\n` +
            `❌ Failed: ${result.length - successCount}\n` +
            `📅 Date: ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Scheduled scraping failed: ${message}`);
      } finally {
        this.isRunning = false;
      }
    }, {
      timezone: 'Asia/Kolkata'
    });

    logger.info('Scraping job scheduled for 4:30 AM IST');
  }

  private scheduleTelegramPost(): void {
    // Run at 5:00 AM IST (which is 11:30 PM UTC)
    cron.schedule('30 23 * * *', async () => {
      try {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Kolkata'
        });

        const { calendarService } = await import('../services');
        const entry = await calendarService.getByDate(today);

        if (entry) {
          const message = formatDailyPanchangam(entry, formattedDate);
          await telegramBot.broadcast(message);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Telegram daily post failed: ${message}`);
      }
    }, {
      timezone: 'Asia/Kolkata'
    });

    logger.info('Telegram post job scheduled for 5:00 AM IST');
  }

  async runManualScrape(daysAhead: number = 7): Promise<void> {
    if (this.isRunning) {
      throw new Error('A scraping job is already running');
    }

    this.isRunning = true;

    try {
      await scraperOrchestrator.scrapeAll(daysAhead);
    } finally {
      this.isRunning = false;
    }
  }
}

function formatDailyPanchangam(entry: any, formattedDate: string): string {
  const tamilDateStr = `${entry.tamilDate.day} ${entry.tamilDate.month} ${entry.tamilDate.year}`;

  let message = `🌅 *தினசரி பஞ்சாங்கம்*\n`;
  message += `📅 ${formattedDate}\n\n`;

  message += `🗓️ *தமிழ் தேதி:* ${tamilDateStr}\n`;
  message += `📿 *திதி:* ${entry.tithi.name} (${entry.tithi.paksha})\n`;
  message += `⭐ *நட்சத்திரம்:* ${entry.nakshatram.name}\n`;

  if (entry.yoga) {
    message += `🧘 *யோகம்:* ${entry.yoga.name}\n`;
  }

  if (entry.karana) {
    message += `🔮 *கரணம்:* ${entry.karana.name}\n`;
  }

  message += `\n🌅 *நேரம்:*\n`;
  message += `   உதயம்: ${formatTime(entry.muhurtas.sunrise)}\n`;
  message += `   அஸ்தமனம்: ${formatTime(entry.muhurtas.sunset)}\n`;

  message += `\n⏰ *முகூர்த்த காலங்கள்:*\n`;
  message += `   ராகு காலம்: ${formatTime(entry.muhurtas.rahuKalam.start)} - ${formatTime(entry.muhurtas.rahuKalam.end)}\n`;
  message += `   யம கண்டம்: ${formatTime(entry.muhurtas.yamagandam.start)} - ${formatTime(entry.muhurtas.yamagandam.end)}\n`;
  message += `   குளிகை: ${formatTime(entry.muhurtas.kuligai.start)} - ${formatTime(entry.muhurtas.kuligai.end)}\n`;

  if (entry.specialDays && entry.specialDays.length > 0) {
    message += `\n🎉 *சிறப்பு நாள்:*\n`;
    entry.specialDays.forEach((day: any) => {
      message += `   • ${day.name}\n`;
    });
  }

  message += `\n_\n`;
  message += `_Tamil Calendar & Panchangam_`;

  return message;
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

export const scheduler = new Scheduler();
