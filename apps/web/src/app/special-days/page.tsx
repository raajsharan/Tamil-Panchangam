'use client';

import { useEffect, useState } from 'react';
import { Header, Footer } from '@/components';
import { useApp } from '@/lib/context';
import { publicApi } from '@/lib/api';

export default function SpecialDaysPage() {
  const { language } = useApp();
  const [specialDays, setSpecialDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialDays = async () => {
      try {
        const result = await publicApi.getUpcomingSpecialDays(20);
        if (result.success && result.data) {
          setSpecialDays(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch special days', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialDays();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 tamil-text">
          {language === 'ta' ? 'சிறப்பு நாட்கள்' : 'Special Days'}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialDays.map((day) => (
              <div key={day._id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tamil-text">
                      {language === 'ta' && day.nameTamil ? day.nameTamil : day.name}
                    </h3>
                    {day.nameEnglish && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{day.nameEnglish}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    day.type === 'major'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : day.type === 'minor'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {day.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(day.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
                {day.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{day.description}</p>
                )}
                {day.category && (
                  <span className="inline-block mt-2 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs">
                    {day.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && specialDays.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'சிறப்பு நாட்கள் எதுவும் கிடைக்கவில்லை.' : 'No special days found.'}
            </p>
          </div>
        )}
      </main>

      <Footer language={language} />
    </div>
  );
}
