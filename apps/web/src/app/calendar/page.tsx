'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components';
import { CalendarGrid } from '@/components/CalendarGrid';
import { useApp } from '@/lib/context';
import { publicApi } from '@/lib/api';

export default function CalendarPage() {
  const { language } = useApp();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);
  const now = new Date();

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    try {
      const result = await publicApi.getByDate(dateStr);
      if (result.success && result.data) {
        setSelectedData(result.data);
      } else {
        setSelectedData(null);
      }
    } catch {
      setSelectedData(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 tamil-text">
          {language === 'ta' ? 'மாதச் சந்தாள்' : 'Monthly Calendar'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CalendarGrid year={now.getFullYear()} month={now.getMonth() + 1} onDateSelect={handleDateSelect} />
          </div>

          <div className="lg:col-span-2">
            {selectedDate ? (
              selectedData ? (
                <DateDetailCard data={selectedData} language={language} />
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'ta'
                      ? 'இந்த தேதிக்கு பஞ்சாங்கம் தரவு இல்லை'
                      : 'No panchangam data available for this date'}
                  </p>
                </div>
              )
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'ta'
                    ? 'தேதியைத் தேர்ந்தெடுக்கவும்'
                    : 'Select a date to view details'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

function DateDetailCard({ data, language }: { data: any; language: 'en' | 'ta' }) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {new Date(data.date).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Kolkata',
        })}
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'தமிழ் தேதி' : 'Tamil Date'}
            </p>
            <p className="font-semibold tamil-text">
              {data.tamilDate.day} {data.tamilDate.month} {data.tamilDate.year}
            </p>
          </div>
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'திதி' : 'Tithi'}
            </p>
            <p className="font-semibold">{data.tithi.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'நட்சத்திரம்' : 'Nakshatram'}
            </p>
            <p className="font-semibold">{data.nakshatram.name}</p>
          </div>
          {data.yoga && (
            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'ta' ? 'யோகம்' : 'Yoga'}
              </p>
              <p className="font-semibold">{data.yoga.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
