'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, Search, Edit, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface CalendarEntry {
  _id: string;
  date: string;
  tamilDate: {
    year: number;
    month: string;
    day: number;
  };
  tithi: {
    name: string;
    paksha: string;
  };
  nakshatram: {
    name: string;
  };
  isManualOverride: boolean;
  isVerified: boolean;
  hasError: boolean;
  source: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminCalendarPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    fetchEntries();
  }, [checkAuth, currentPage]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const result = await api.get<CalendarEntry[]>(
        `/api/admin/calendar?page=${currentPage}&limit=20`
      );
      if (result.success && result.data) {
        setEntries(result.data as any);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch calendar entries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEntries();
      return;
    }

    setLoading(true);
    try {
      const result = await api.get<CalendarEntry[]>(
        `/api/calendar/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (result.success && result.data) {
        setEntries(result.data as any);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Calendar Manager
            </h1>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by tithi, nakshatram, month..."
                className="input pl-10"
              />
            </div>
            <button onClick={handleSearch} className="btn-primary">
              Search
            </button>
            <Link href="/admin/calendar/new" className="btn-secondary">
              Add Entry
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tamil Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tithi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Nakshatram
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {entries.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {entry.tamilDate.day} {entry.tamilDate.month} {entry.tamilDate.year}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {entry.tithi.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {entry.nakshatram.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {entry.isManualOverride && (
                              <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                Manual
                              </span>
                            )}
                            {entry.hasError && (
                              <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                Error
                              </span>
                            )}
                            {!entry.isVerified && (
                              <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                Unverified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/calendar/edit/${entry.date}`}
                            className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
