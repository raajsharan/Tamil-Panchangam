import { ScraperStatus } from '../models';
import { IScraperStatus } from '../types';

export class ScraperService {
  async getStatus(source: string): Promise<IScraperStatus | null> {
    return ScraperStatus.findOne({ source });
  }

  async getAllStatuses(): Promise<IScraperStatus[]> {
    return ScraperStatus.find().sort({ lastRun: -1 });
  }

  async updateStatus(
    source: string,
    data: Partial<IScraperStatus>
  ): Promise<IScraperStatus> {
    const status = await ScraperStatus.findOneAndUpdate(
      { source },
      {
        ...data,
        lastRun: new Date()
      },
      { new: true, upsert: true }
    );

    return status;
  }

  async recordSuccess(
    source: string,
    recordsProcessed: number,
    responseTime: number
  ): Promise<void> {
    const existing = await ScraperStatus.findOne({ source });

    let successRate = 100;
    if (existing) {
      const totalRuns = existing.recordsProcessed + recordsProcessed;
      const prevSuccessCount = (existing.successRate || 100) * existing.recordsProcessed / 100;
      successRate = ((prevSuccessCount + recordsProcessed) / totalRuns) * 100;
    }

    await this.updateStatus(source, {
      status: 'success',
      recordsProcessed,
      avgResponseTime: responseTime,
      successRate,
      errors: []
    });
  }

  async recordFailure(source: string, error: string): Promise<void> {
    const existing = await ScraperStatus.findOne({ source });

    let successRate = 0;
    if (existing && existing.recordsProcessed > 0) {
      const totalRuns = existing.recordsProcessed + 1;
      const prevSuccessCount = (existing.successRate || 100) * existing.recordsProcessed / 100;
      successRate = (prevSuccessCount / totalRuns) * 100;
    }

    const errors = existing?.errors || [];
    errors.push(`${new Date().toISOString()}: ${error}`);

    if (errors.length > 10) {
      errors.splice(0, errors.length - 10);
    }

    await this.updateStatus(source, {
      status: 'failed',
      errors
    });
  }

  async getNextScheduledRun(source: string): Promise<Date | null> {
    const status = await this.getStatus(source);
    return status?.nextRun || null;
  }

  async setNextScheduledRun(source: string, nextRun: Date): Promise<void> {
    await ScraperStatus.findOneAndUpdate(
      { source },
      { nextRun },
      { upsert: true }
    );
  }

  async getHealthSummary(): Promise<{
    total: number;
    healthy: number;
    unhealthy: number;
    lastRun: Date | null;
  }> {
    const statuses = await this.getAllStatuses();

    const healthy = statuses.filter(s => s.status === 'success').length;
    const lastRun = statuses.length > 0
      ? statuses.reduce((latest, s) => s.lastRun > latest ? s.lastRun : latest, statuses[0].lastRun)
      : null;

    return {
      total: statuses.length,
      healthy,
      unhealthy: statuses.length - healthy,
      lastRun
    };
  }
}

export const scraperService = new ScraperService();
