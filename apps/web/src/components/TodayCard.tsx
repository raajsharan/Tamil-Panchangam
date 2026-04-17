'use client';

import { Sunrise, Sunset, Star, Moon, Sun, Clock } from 'lucide-react';
import { useApp } from '@/lib/context';
import { formatTime, getTamilDayName } from '@/lib/utils';

interface TodayCardProps {
  data: any;
}

export function TodayCard({ data }: TodayCardProps) {
  const { language } = useApp();

  if (!data) return null;

  const today = new Date(data.date);
  const tamilDateStr = `${data.tamilDate.day} ${data.tamilDate.month} ${data.tamilDate.year}`;

  return (
    <div className="card space-y-6">
      <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {today.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Kolkata',
          })}
        </p>
        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2 tamil-text">
          {getTamilDayName(today)}
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-1 tamil-text">
          {language === 'ta' ? 'தமிழ் தேதி:' : 'Tamil Date:'} {tamilDateStr}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
          <Moon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'திதி' : 'Tithi'}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.tithi.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.tithi.paksha === 'Shukla'
                ? language === 'ta'
                  ? 'சுக்ல'
                  : 'Shukla'
                : language === 'ta'
                ? 'கிருஷ்ண'
                : 'Krishna'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
          <Star className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'நட்சத்திரம்' : 'Nakshatram'}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {data.nakshatram.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'தங்கப் பிரஃஷ்:' : 'Lord:'} {data.nakshatram.lord}
            </p>
          </div>
        </div>
      </div>

      {data.yoga && (
        <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
          <Sun className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'யோகம்' : 'Yoga'}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">{data.yoga.name}</p>
          </div>
        </div>
      )}

      {data.karana && (
        <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
          <Moon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'கரணம்' : 'Karana'}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">{data.karana.name}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
          <Sunrise className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'உதயம்' : 'Sunrise'}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatTime(data.muhurtas.sunrise)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
          <Sunset className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'அஸ்தமனம்' : 'Sunset'}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatTime(data.muhurtas.sunset)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          {language === 'ta' ? 'முகூர்த்த காலங்கள்' : 'Auspicious Times'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'ராகு காலம்' : 'Rahu Kalam'}
            </p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              {formatTime(data.muhurtas.rahuKalam.start)} - {formatTime(data.muhurtas.rahuKalam.end)}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'யம கண்டம்' : 'Yamagandam'}
            </p>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">
              {formatTime(data.muhurtas.yamagandam.start)} - {formatTime(data.muhurtas.yamagandam.end)}
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ta' ? 'குளிகை' : 'Kuligai'}
            </p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {formatTime(data.muhurtas.kuligai.start)} - {formatTime(data.muhurtas.kuligai.end)}
            </p>
          </div>
        </div>
      </div>

      {data.specialDays && data.specialDays.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'ta' ? 'சிறப்பு நாள்' : 'Special Day'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.specialDays.map((day: any, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
              >
                {day.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
