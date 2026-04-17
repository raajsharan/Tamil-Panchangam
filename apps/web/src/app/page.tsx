'use client';

import { useEffect, useState } from 'react';
import { Header, Footer, TodayCard } from '@/components';
import { useApp } from '@/lib/context';
import { publicApi } from '@/lib/api';

export default function HomePage() {
  const { language, loading, error } = useApp();
  const [todayData, setTodayData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await publicApi.getToday();
        if (result.success && result.data) {
          setTodayData(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch today data', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {dataLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : todayData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 tamil-text">
                {language === 'ta' ? 'இன்றைய பஞ்சாங்கம்' : 'Today\'s Panchangam'}
              </h1>
              <TodayCard data={todayData} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tamil-text">
                {language === 'ta' ? 'சிறப்பு நாட்கள்' : 'Special Days'}
              </h2>
              <SpecialDaysList />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ta'
                ? 'இன்றைய பஞ்சாங்கம் தரவு கிடைக்கவில்லை. தயவுசெய்து பின்னர் முயற்சிக்கவும்.'
                : 'Today\'s calendar data is not available. Please try again later.'}
            </p>
          </div>
        )}
      </main>

      <Footer language={language} />
    </div>
  );
}

function SpecialDaysList() {
  const { language } = useApp();
  const [specialDays, setSpecialDays] = useState<any[]>([]);

  useEffect(() => {
    const fetchSpecialDays = async () => {
      try {
        const result = await publicApi.getUpcomingSpecialDays(5);
        if (result.success && result.data) {
          setSpecialDays(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch special days', err);
      }
    };
    fetchSpecialDays();
  }, []);

  if (specialDays.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        {language === 'ta' ? 'வரவிருக்கும் சிறப்பு நாட்கள் எதுவும் இல்லை.' : 'No upcoming special days.'}
      </p>
    );
  }

  return (
    <div className="card space-y-3">
      {specialDays.map((day: any) => (
        <div key={day._id} className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {language === 'ta' && day.nameTamil ? day.nameTamil : day.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(day.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            day.type === 'major'
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {day.type}
          </span>
        </div>
      ))}
    </div>
  );
}
