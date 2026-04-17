import express, { Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { helmetMiddleware, corsMiddleware, rateLimiter, requestLogger, errorHandler } from './middleware';
import { setupRoutes } from './routes';
import { logger } from './utils';
import { scheduler } from './cron';
import { telegramBot } from './cron/TelegramBot';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use(requestLogger);

const router = Router();
setupRoutes(router);
app.use('/api', router);

app.use(errorHandler);

async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    throw new Error('MONGODB_URI or DATABASE_URL environment variable is required');
  }

  await mongoose.connect(mongoUri);

  logger.info('Connected to MongoDB');
}

async function seedAdmin(): Promise<void> {
  const { Admin } = await import('./models');

  const adminExists = await Admin.findOne({ email: 'admin@tamilcalendar.com' });

  if (!adminExists) {
    await Admin.create({
      email: 'admin@tamilcalendar.com',
      password: 'admin123',
      role: 'super-admin'
    });

    logger.info('Default admin created: admin@tamilcalendar.com / admin123');
  }
}

function setupTelegramWebhook(): void {
  const webhookEnabled = process.env.TELEGRAM_WEBHOOK_URL;
  if (webhookEnabled) {
    telegramBot.setupWebhookRoute(app);
    logger.info('Telegram webhook route configured');
  }
}

async function startServer(): Promise<void> {
  try {
    await connectDB();
    await seedAdmin();

    telegramBot.initialize();
    setupTelegramWebhook();
    scheduler.start();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await telegramBot.stop();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await telegramBot.stop();
  await mongoose.connection.close();
  process.exit(0);
});

startServer();

export default app;
