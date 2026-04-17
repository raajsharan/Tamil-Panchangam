'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import { api } from '@/lib/api';

interface SpecialDay {
  _id: string;
  name: string;
  nameTamil?: string;
  type: 'major' | 'minor' | 'regional' | 'national';
  category?: string;
  date: string;
  isActive: boolean;
}

export default function AdminSpecialDaysPage() {
  const router = useRouter();
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
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
    fetchSpecialDays();
  }, [checkAuth]);

  const fetchSpecialDays = async () => {
    try {
      const result = await api.get<SpecialDay[]>('/api/special-days?limit=100');
      if (result.success && result.data) {
        setSpecialDays(result.data as any);
      }
    } catch (err) {
      console.error('Failed to fetch special days', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this special day?')) return;

    try {
      const result = await api.delete(`/api/special-days/${id}`);
      if (result.success) {
        setSpecialDays((prev) => prev.filter((day) => day._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete special day', err);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const result = await api.put(`/api/special-days/${id}`, { isActive: !currentState });
      if (result.success) {
        setSpecialDays((prev) =>
          prev.map((day) => (day._id === id ? { ...day, isActive: !currentState } : day))
        );
      }
    } catch (err) {
      console.error('Failed to toggle special day', err);
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
              Special Days Manager
            </h1>
          </div>
          <Link href="/admin/special-days/new" className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Special Day</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tamil Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
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
                {specialDays.map((day) => (
                  <tr key={day._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {day.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {day.nameTamil || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(day.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          day.type === 'major'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : day.type === 'minor'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {day.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(day._id, day.isActive)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded ${
                          day.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {day.isActive ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/special-days/edit/${day._id}`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Link>
                        <button
                          onClick={() => handleDelete(day._id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
