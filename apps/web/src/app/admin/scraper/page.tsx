'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, ChevronLeft, Bot } from 'lucide-react';
import { api } from '@/lib/api';

interface ScraperStatus {
  source: string;
  lastRun: string;
  status: 'success' | 'failed' | 'partial';
  recordsProcessed: number;
  errors: string[];
  avgResponseTime?: number;
  successRate?: number;
}

export default function AdminScraperPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<ScraperStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any>(null);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return false;
    }
    return true;
  }, [router]);

  useEffect(() => {
    if (!checkAuth()) return;
    fetchStatus();
  }, [checkAuth]);

  const fetchStatus = async () => {
    try {
      const result = await api.get<{ statuses: ScraperStatus[] }>('/api/admin/scraper/status');
      if (result.success && result.data) {
        setStatuses(result.data.statuses);
      }
    } catch (err) {
      console.error('Failed to fetch scraper status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScrape = async () => {
    setRunning(true);
    setScrapeResult(null);

    try {
      const result = await api.post<any>('/api/admin/scraper/run', { daysAhead: 7 });
      setScrapeResult(result.data);
      await fetchStatus();
    } catch (err) {
      console.error('Scraping failed', err);
    } finally {
      setRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/dashboard"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scraper Control</h1>
          </div>
          <button
            onClick={handleRunScrape}
            disabled={running}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={`h-5 w-5 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Running...' : 'Run Scrape (7 days)'}</span>
          </button>
        </div>

        {scrapeResult && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Last Scrape Result
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {scrapeResult.successful}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {scrapeResult.failed}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {scrapeResult.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statuses.map((status) => (
              <div key={status.source} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Bot className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {status.source}
                    </h2>
                  </div>
                  {getStatusIcon(status.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Last Run</span>
                    <span className="text-gray-900 dark:text-white text-sm">
                      {status.lastRun
                        ? new Date(status.lastRun).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                          })
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Records Processed</span>
                    <span className="text-gray-900 dark:text-white">{status.recordsProcessed}</span>
                  </div>
                  {status.avgResponseTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Avg Response Time</span>
                      <span className="text-gray-900 dark:text-white">
                        {status.avgResponseTime.toFixed(0)}ms
                      </span>
                    </div>
                  )}
                  {status.successRate !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Success Rate</span>
                      <span className="text-gray-900 dark:text-white">
                        {status.successRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {status.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      Recent Errors:
                    </p>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {status.errors.slice(-3).map((err, i) => (
                        <p key={i} className="text-xs text-red-600 dark:text-red-400">
                          {err}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
