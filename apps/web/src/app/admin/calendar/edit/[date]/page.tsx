'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface CalendarEntry {
  date: string;
  tamilDate: {
    year: number;
    yearName: string;
    month: string;
    day: number;
  };
  tithi: {
    name: string;
    number: number;
    paksha: 'Shukla' | 'Krishna';
    start: string;
    end: string;
  };
  nakshatram: {
    name: string;
    lord: string;
  };
  yoga?: {
    name: string;
    number: number;
  };
  karana?: {
    name: string;
  };
  muhurtas: {
    sunrise: string;
    sunset: string;
    rahuKalam: { start: string; end: string };
    yamagandam: { start: string; end: string };
    kuligai: { start: string; end: string };
  };
}

export default function EditCalendarPage() {
  const router = useRouter();
  const params = useParams();
  const date = params.date as string;

  const [entry, setEntry] = useState<CalendarEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

    const fetchEntry = async () => {
      try {
        const result = await api.get<CalendarEntry>(`/api/calendar/date/${date}`);
        if (result.success && result.data) {
          setEntry(result.data);
        } else {
          setError('Entry not found');
        }
      } catch (err) {
        setError('Failed to load entry');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [checkAuth, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;

    setSaving(true);
    setError('');

    try {
      const result = await api.put(`/api/admin/calendar/${date}`, entry);
      if (result.success) {
        router.push('/admin/calendar');
      } else {
        setError(result.error || 'Failed to update');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update entry');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setEntry((prev) => {
      if (!prev) return prev;
      const fields = field.split('.');
      if (fields.length === 1) {
        return { ...prev, [field]: value };
      }
      const [parent, child] = fields;
      return {
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      };
    });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/admin/calendar"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Calendar Entry
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {entry && (
          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tamil Date
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={entry.tamilDate.year}
                    onChange={(e) => handleChange('tamilDate.year', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Month
                  </label>
                  <input
                    type="text"
                    value={entry.tamilDate.month}
                    onChange={(e) => handleChange('tamilDate.month', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Day
                  </label>
                  <input
                    type="number"
                    value={entry.tamilDate.day}
                    onChange={(e) => handleChange('tamilDate.day', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year Name
                  </label>
                  <input
                    type="text"
                    value={entry.tamilDate.yearName}
                    onChange={(e) => handleChange('tamilDate.yearName', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tithi</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={entry.tithi.name}
                    onChange={(e) => handleChange('tithi.name', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number
                  </label>
                  <input
                    type="number"
                    value={entry.tithi.number}
                    onChange={(e) => handleChange('tithi.number', parseInt(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Paksha
                  </label>
                  <select
                    value={entry.tithi.paksha}
                    onChange={(e) => handleChange('tithi.paksha', e.target.value)}
                    className="input"
                  >
                    <option value="Shukla">Shukla</option>
                    <option value="Krishna">Krishna</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nakshatram
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={entry.nakshatram.name}
                    onChange={(e) => handleChange('nakshatram.name', e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lord
                  </label>
                  <input
                    type="text"
                    value={entry.nakshatram.lord}
                    onChange={(e) => handleChange('nakshatram.lord', e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/admin/calendar" className="btn-secondary">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="btn-primary flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
