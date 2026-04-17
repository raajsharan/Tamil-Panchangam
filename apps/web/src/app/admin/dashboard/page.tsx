'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  LogOut,
  Settings,
  FileText,
  Bot,
} from 'lucide-react';
import { Header } from '@/components';
import { api } from '@/lib/api';

interface DashboardStats {
  total: number;
  verified: number;
  unverified: number;
  withErrors: number;
  manualOverrides: number;
}

interface ScraperHealth {
  total: number;
  healthy: number;
  unhealthy: number;
  lastRun: string | null;
}

interface RecentLog {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scraperHealth, setScraperHealth] = useState<ScraperHealth | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);

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

    const fetchData = async () => {
      try {
        const [statsRes, scraperRes, logsRes] = await Promise.all([
          api.get<DashboardStats>('/api/admin/calendar/stats'),
          api.get<{ health: ScraperHealth }>('/api/admin/scraper/status'),
          api.get<{ data: RecentLog[] }>('/api/admin/logs?limit=10'),
        ]);

        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (scraperRes.success && scraperRes.data) setScraperHealth(scraperRes.data.health);
        if (logsRes.success && logsRes.data) setRecentLogs(logsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Entries"
            value={stats?.total || 0}
            icon={<Database className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Verified"
            value={stats?.verified || 0}
            icon={<CheckCircle className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Unverified"
            value={stats?.unverified || 0}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
          />
          <StatCard
            title="With Errors"
            value={stats?.withErrors || 0}
            icon={<AlertTriangle className="h-6 w-6" />}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                Scraper Status
              </h2>
              <Link
                href="/admin/scraper"
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
              >
                Manage
              </Link>
            </div>
            {scraperHealth ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Sources</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {scraperHealth.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Healthy</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {scraperHealth.healthy}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Unhealthy</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {scraperHealth.unhealthy}
                  </span>
                </div>
                {scraperHealth.lastRun && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Run</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {new Date(scraperHealth.lastRun).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                      })}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No scraper data available</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Recent Logs
              </h2>
              <Link
                href="/admin/logs"
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
              >
                View All
              </Link>
            </div>
            {recentLogs.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                  >
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        log.type === 'error'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : log.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}
                    >
                      {log.type}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{log.message}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Kolkata',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No recent logs</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminCard
            title="Calendar Manager"
            description="View and edit calendar entries"
            href="/admin/calendar"
            icon={<Calendar className="h-6 w-6" />}
          />
          <AdminCard
            title="Scraper Control"
            description="Manage data scrapers"
            href="/admin/scraper"
            icon={<RefreshCw className="h-6 w-6" />}
          />
          <AdminCard
            title="Special Days"
            description="Manage festivals and events"
            href="/admin/special-days"
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <AdminCard
            title="Logs & History"
            description="View system logs"
            href="/admin/logs"
            icon={<FileText className="h-6 w-6" />}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function AdminCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card hover:shadow-lg transition-shadow group"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 group-hover:bg-primary-200 dark:group-hover:bg-primary-900 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}
