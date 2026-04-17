import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import { TelegramSubscriber } from '../models';
import { logger } from '../utils';

export class TelegramBotService {
  private bot: TelegramBot | null = null;

  initialize(): void {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      logger.warn('Telegram bot token not configured - bot will not be started');
      return;
    }

    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    const useWebhook = !!webhookUrl;

    if (useWebhook) {
      this.bot = new TelegramBot(token, { polling: false });
      this.setupWebhook(webhookUrl);
    } else {
      this.bot = new TelegramBot(token, { polling: true });
    }

    this.setupCommandHandlers();
    logger.info(`Telegram bot initialized in ${useWebhook ? 'webhook' : 'polling'} mode`);
  }

  private async setupWebhook(webhookUrl: string): Promise<void> {
    if (!this.bot) return;

    try {
      await this.bot.setWebHook(webhookUrl);
      logger.info(`Telegram webhook set: ${webhookUrl}`);
    } catch (error) {
      logger.error(`Failed to set Telegram webhook: ${error}`);
      throw error;
    }
  }

  public setupWebhookRoute(expressApp: express.Application): void {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || !this.bot) return;

    expressApp.post(`/telegram/webhook/${token}`, (req, res) => {
      this.bot?.processUpdate(req.body);
      res.sendStatus(200);
    });
  }

  private setupCommandHandlers(): void {
    if (!this.bot) return;

    this.bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    this.bot.onText(/\/help/, (msg) => {
      this.handleHelp(msg);
    });

    this.bot.onText(/\/today/, (msg) => {
      this.handleToday(msg);
    });

    this.bot.onText(/\/tomorrow/, (msg) => {
      this.handleTomorrow(msg);
    });

    this.bot.onText(/\/amavasya/, (msg) => {
      this.handleAmavasya(msg);
    });

    this.bot.onText(/\/pournami/, (msg) => {
      this.handlePournami(msg);
    });

    this.bot.onText(/\/subscribe/, (msg) => {
      this.handleSubscribe(msg);
    });

    this.bot.onText(/\/unsubscribe/, (msg) => {
      this.handleUnsubscribe(msg);
    });

    this.bot.onText(/\/language/, (msg) => {
      this.handleLanguage(msg);
    });

    this.bot.on('message', (msg) => {
      this.handleUnknownCommand(msg);
    });

    this.bot.on('callback_query', (callbackQuery) => {
      this.handleCallbackQuery(callbackQuery);
    });
  }

  private async handleStart(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const welcomeMessage = `🙏 Welcome to Tamil Calendar Bot!\n\n` +
      `I provide daily Tamil calendar and Panchangam information.\n\n` +
      `Use /help to see available commands.`;

    this.sendMessage(chatId, welcomeMessage);
    await this.addSubscriber(msg);
  }

  private async handleHelp(msg: TelegramBot.Message): Promise<void> {
    const helpMessage = `📚 *Available Commands:*\n\n` +
      `📅 /today - Today's Panchangam\n` +
      `📅 /tomorrow - Tomorrow's Panchangam\n` +
      `🌑 /amavasya - Next Amavasya date\n` +
      `🌕 /pournami - Next Pournami date\n` +
      `🔔 /subscribe - Subscribe to daily updates\n` +
      `🔕 /unsubscribe - Unsubscribe from updates\n` +
      `🌐 /language - Change language\n` +
      `❓ /help - Show this help message`;

    this.sendMessage(msg.chat.id, helpMessage);
  }

  private async handleToday(msg: TelegramBot.Message): Promise<void> {
    try {
      const { calendarService } = await import('../services');
      const today = new Date();
      const entry = await calendarService.getByDate(today);

      if (entry) {
        const message = this.formatCalendarEntry(entry, 'ta');
        this.sendMessage(msg.chat.id, message);
      } else {
        this.sendMessage(msg.chat.id, 'No data available for today. Please try again later.');
      }
    } catch (error) {
      logger.error(`Error handling /today command: ${error}`);
      this.sendMessage(msg.chat.id, 'Error retrieving data. Please try again later.');
    }
  }

  private async handleTomorrow(msg: TelegramBot.Message): Promise<void> {
    try {
      const { calendarService } = await import('../services');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const entry = await calendarService.getByDate(tomorrow);

      if (entry) {
        const message = this.formatCalendarEntry(entry, 'ta');
        this.sendMessage(msg.chat.id, message);
      } else {
        this.sendMessage(msg.chat.id, 'No data available for tomorrow. Please try again later.');
      }
    } catch (error) {
      logger.error(`Error handling /tomorrow command: ${error}`);
      this.sendMessage(msg.chat.id, 'Error retrieving data. Please try again later.');
    }
  }

  private async handleAmavasya(msg: TelegramBot.Message): Promise<void> {
    try {
      const { SpecialDay } = await import('../models');
      const today = new Date();

      const amavasyaDays = await SpecialDay.find({
        nameTamil: { $regex: /அமாவாசி/i },
        date: { $gte: today },
        isActive: true
      })
        .sort({ date: 1 })
        .limit(1);

      if (amavasyaDays.length > 0) {
        const nextAmavasya = amavasyaDays[0];
        const dateStr = nextAmavasya.date.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Kolkata'
        });

        this.sendMessage(msg.chat.id,
          `🌑 *Next Amavasya (அமாவாசி)*\n\n` +
          `📅 Date: ${dateStr}\n` +
          `📿 ${nextAmavasya.name}`
        );
      } else {
        this.sendMessage(msg.chat.id, 'No upcoming Amavasya dates found.');
      }
    } catch (error) {
      logger.error(`Error handling /amavasya command: ${error}`);
      this.sendMessage(msg.chat.id, 'Error retrieving data. Please try again later.');
    }
  }

  private async handlePournami(msg: TelegramBot.Message): Promise<void> {
    try {
      const { SpecialDay } = await import('../models');
      const today = new Date();

      const pournamiDays = await SpecialDay.find({
        $or: [
          { nameTamil: { $regex: /பவுர்ணமி/i } },
          { name: { $regex: /Pournami/i } }
        ],
        date: { $gte: today },
        isActive: true
      })
        .sort({ date: 1 })
        .limit(1);

      if (pournamiDays.length > 0) {
        const nextPournami = pournamiDays[0];
        const dateStr = nextPournami.date.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Kolkata'
        });

        this.sendMessage(msg.chat.id,
          `🌕 *Next Pournami (பவுர்ணமி)*\n\n` +
          `📅 Date: ${dateStr}\n` +
          `📿 ${nextPournami.name}`
        );
      } else {
        this.sendMessage(msg.chat.id, 'No upcoming Pournami dates found.');
      }
    } catch (error) {
      logger.error(`Error handling /pournami command: ${error}`);
      this.sendMessage(msg.chat.id, 'Error retrieving data. Please try again later.');
    }
  }

  private async handleSubscribe(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;

    await this.addSubscriber(msg);
    this.sendMessage(chatId, '🔔 *Subscribed!*\n\nYou will receive daily Panchangam updates at 5:00 AM IST.');
  }

  private async handleUnsubscribe(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;

    await TelegramSubscriber.findOneAndUpdate(
      { telegramId: msg.from?.id.toString() },
      { subscribed: false }
    );

    this.sendMessage(chatId, '🔕 *Unsubscribed*\n\nYou will no longer receive daily updates.');
  }

  private async handleLanguage(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const keyboard = {
      inline_keyboard: [
        [
          { text: 'English', callback_data: 'lang_en' },
          { text: 'தமிழ்', callback_data: 'lang_ta' }
        ]
      ]
    };

    this.sendMessage(chatId, '🌐 *Select Language:*', keyboard);
  }

  private async handleUnknownCommand(msg: TelegramBot.Message): Promise<void> {
    if (msg.text?.startsWith('/')) {
      this.sendMessage(msg.chat.id, `❓ Unknown command. Use /help to see available commands.`);
    }
  }

  private async handleCallbackQuery(callbackQuery: TelegramBot.CallbackQuery): Promise<void> {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data;

    if (!chatId || !data) return;

    if (data.startsWith('lang_')) {
      const language = data.replace('lang_', '');
      await this.updateLanguagePreference(chatId, language as 'en' | 'ta');

      await this.bot?.answerCallbackQuery(callbackQuery.id, {
        text: `Language set to ${language === 'en' ? 'English' : 'தமிழ்'}`,
        show_alert: true
      });
    }
  }

  private async updateLanguagePreference(chatId: number, language: 'en' | 'ta'): Promise<void> {
    try {
      const { TelegramSubscriber } = await import('../models');
      await TelegramSubscriber.findOneAndUpdate(
        { telegramId: chatId.toString() },
        { language: language }
      );
      this.sendMessage(chatId, `🌐 Language preference updated to ${language === 'en' ? 'English' : 'தமிழ்'}`);
    } catch (error) {
      logger.error(`Error updating language preference: ${error}`);
    }
  }

  private async addSubscriber(msg: TelegramBot.Message): Promise<void> {
    if (!msg.from) return;

    await TelegramSubscriber.findOneAndUpdate(
      { telegramId: msg.from.id.toString() },
      {
        telegramId: msg.from.id.toString(),
        username: msg.from.username,
        firstName: msg.from.first_name,
        lastName: msg.from.last_name,
        lastInteraction: new Date(),
        subscribed: true,
        notificationsEnabled: true
      },
      { upsert: true }
    );
  }

  private formatCalendarEntry(entry: any, language: 'en' | 'ta'): string {
    if (language === 'ta') {
      return this.formatCalendarEntryTamil(entry);
    }
    return this.formatCalendarEntryEnglish(entry);
  }

  private formatCalendarEntryTamil(entry: any): string {
    const tamilDateStr = `${entry.tamilDate.day} ${entry.tamilDate.month} ${entry.tamilDate.year}`;
    const formattedDate = new Date(entry.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    let message = `🌅 *தினசரி பஞ்சாங்கம்*\n`;
    message += `📅 ${formattedDate}\n\n`;
    message += `🗓️ *தமிழ் தேதி:* ${tamilDateStr}\n`;
    message += `📿 *திதி:* ${entry.tithi.name} (${entry.tithi.paksha === 'Shukla' ? 'சுக்ல' : 'கிருஷ்ண'})\n`;
    message += `⭐ *நட்சத்திரம்:* ${entry.nakshatram.name}\n`;

    if (entry.yoga) {
      message += `🧘 *யோகம்:* ${entry.yoga.name}\n`;
    }

    if (entry.karana) {
      message += `🔮 *கரணம்:* ${entry.karana.name}\n`;
    }

    message += `\n🌅 *நேரம்:*\n`;
    message += `   உதயம்: ${this.formatTime(entry.muhurtas.sunrise)}\n`;
    message += `   அஸ்தமனம்: ${this.formatTime(entry.muhurtas.sunset)}\n`;

    message += `\n⏰ *முகூர்த்த காலங்கள்:*\n`;
    message += `   ராகு: ${this.formatTime(entry.muhurtas.rahuKalam.start)} - ${this.formatTime(entry.muhurtas.rahuKalam.end)}\n`;
    message += `   யம கண்டம்: ${this.formatTime(entry.muhurtas.yamagandam.start)} - ${this.formatTime(entry.muhurtas.yamagandam.end)}\n`;
    message += `   குளிகை: ${this.formatTime(entry.muhurtas.kuligai.start)} - ${this.formatTime(entry.muhurtas.kuligai.end)}\n`;

    if (entry.specialDays && entry.specialDays.length > 0) {
      message += `\n🎉 *சிறப்பு நாள்:*\n`;
      entry.specialDays.forEach((day: any) => {
        message += `   • ${day.name}\n`;
      });
    }

    return message;
  }

  private formatCalendarEntryEnglish(entry: any): string {
    const formattedDate = new Date(entry.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    let message = `🌅 *Daily Panchangam*\n`;
    message += `📅 ${formattedDate}\n\n`;
    message += `🗓️ *Tamil Date:* ${entry.tamilDate.day} ${entry.tamilDate.month} ${entry.tamilDate.year}\n`;
    message += `📿 *Tithi:* ${entry.tithi.name} (${entry.tithi.paksha})\n`;
    message += `⭐ *Nakshatram:* ${entry.nakshatram.name}\n`;

    if (entry.yoga) {
      message += `🧘 *Yoga:* ${entry.yoga.name}\n`;
    }

    if (entry.karana) {
      message += `🔮 *Karana:* ${entry.karana.name}\n`;
    }

    message += `\n🌅 *Times:*\n`;
    message += `   Sunrise: ${this.formatTime(entry.muhurtas.sunrise)}\n`;
    message += `   Sunset: ${this.formatTime(entry.muhurtas.sunset)}\n`;

    message += `\n⏰ *Auspicious Times:*\n`;
    message += `   Rahu Kalam: ${this.formatTime(entry.muhurtas.rahuKalam.start)} - ${this.formatTime(entry.muhurtas.rahuKalam.end)}\n`;
    message += `   Yamagandam: ${this.formatTime(entry.muhurtas.yamagandam.start)} - ${this.formatTime(entry.muhurtas.yamagandam.end)}\n`;
    message += `   Kuligai: ${this.formatTime(entry.muhurtas.kuligai.start)} - ${this.formatTime(entry.muhurtas.kuligai.end)}\n`;

    if (entry.specialDays && entry.specialDays.length > 0) {
      message += `\n🎉 *Special Days:*\n`;
      entry.specialDays.forEach((day: any) => {
        message += `   • ${day.name}\n`;
      });
    }

    return message;
  }

  private formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  }

  async sendMessage(chatId: number, text: string, replyMarkup?: any): Promise<void> {
    if (!this.bot) {
      logger.warn('Bot not initialized - message not sent');
      return;
    }

    try {
      await this.bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
      });
    } catch (error) {
      logger.error(`Error sending telegram message: ${error}`);
    }
  }

  async broadcast(text: string): Promise<void> {
    const subscribers = await TelegramSubscriber.find({
      subscribed: true,
      notificationsEnabled: true
    });

    for (const subscriber of subscribers) {
      await this.sendMessage(parseInt(subscriber.telegramId), text);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info(`Broadcast sent to ${subscribers.length} subscribers`);
  }

  async stop(): Promise<void> {
    if (this.bot) {
      this.bot.stopPolling();
      this.bot = null;
      logger.info('Telegram bot stopped');
    }
  }
}

export const telegramBot = new TelegramBotService();
