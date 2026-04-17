'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatDate, getMonthName } from '@/lib/utils';

interface CalendarGridProps {
  year: number;
  month: number;
  onDateSelect?: (date: Date) => void;
}

export function CalendarGrid({ year, month, onDateSelect }: CalendarGridProps) {
  const { language } = useApp();
  const [currentYear, setCurrentYear] = useState(year);
  const [currentMonth, setCurrentMonth] = useState(month);

  const firstDay = new Date(currentYear, currentMonth - 1, 1);
  const lastDay = new Date(currentYear, currentMonth, 0);
  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days = language === 'ta'
    ? ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const months = Array.from({ length: 12 }, (_, i) => getMonthName(i, language));

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth - 1, day);
    onDateSelect?.(date);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {months[currentMonth - 1]} {currentYear}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDay }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: totalDays }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentYear, currentMonth - 1, day);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                ${isToday
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
