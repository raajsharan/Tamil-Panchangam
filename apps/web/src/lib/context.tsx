import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CalendarEntry {
  _id: string;
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
    pada?: number;
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
    moonrise?: string;
    moonset?: string;
    rahuKalam: { start: string; end: string };
    yamagandam: { start: string; end: string };
    kuligai: { start: string; end: string };
    abhijit?: { start: string; end: string };
    brahmaMuhurta?: { start: string; end: string };
  };
  specialDays: Array<{
    name: string;
    nameTamil?: string;
    type: string;
    category?: string;
  }>;
  isManualOverride: boolean;
  isVerified: boolean;
  hasError: boolean;
  source: string;
}

interface SpecialDay {
  _id: string;
  name: string;
  nameTamil?: string;
  nameEnglish?: string;
  type: 'major' | 'minor' | 'regional' | 'national';
  category?: string;
  date: string;
  description?: string;
  isActive: boolean;
}

interface AppState {
  language: 'en' | 'ta';
  darkMode: boolean;
  todayData: CalendarEntry | null;
  loading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  setLanguage: (lang: 'en' | 'ta') => void;
  setDarkMode: (dark: boolean) => void;
  fetchToday: () => Promise<void>;
  getCalendarByDate: (date: string) => Promise<CalendarEntry | null>;
  getSpecialDays: (date: string) => Promise<SpecialDay[]>;
  getUpcomingSpecialDays: (limit?: number) => Promise<SpecialDay[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    language: (typeof window !== 'undefined' && localStorage.getItem('language') as 'en' | 'ta') || 'ta',
    darkMode: false,
    todayData: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setState(prev => ({ ...prev, darkMode: savedDarkMode === 'true' }));
    }
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const setLanguage = (lang: 'en' | 'ta') => {
    localStorage.setItem('language', lang);
    setState(prev => ({ ...prev, language: lang }));
  };

  const setDarkMode = (dark: boolean) => {
    localStorage.setItem('darkMode', String(dark));
    setState(prev => ({ ...prev, darkMode: dark }));
  };

  const fetchToday = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${API_URL}/api/calendar/today`);
      const result: ApiResponse<CalendarEntry> = await response.json();
      if (result.success && result.data) {
        setState(prev => ({ ...prev, todayData: result.data, loading: false }));
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Failed to fetch data', loading: false }));
      }
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Network error', loading: false }));
    }
  };

  const getCalendarByDate = async (date: string): Promise<CalendarEntry | null> => {
    try {
      const response = await fetch(`${API_URL}/api/calendar/date/${date}`);
      const result: ApiResponse<CalendarEntry> = await response.json();
      return result.success && result.data ? result.data : null;
    } catch {
      return null;
    }
  };

  const getSpecialDays = async (date: string): Promise<SpecialDay[]> => {
    try {
      const response = await fetch(`${API_URL}/api/special-days/date/${date}`);
      const result: ApiResponse<SpecialDay[]> = await response.json();
      return result.success && result.data ? result.data : [];
    } catch {
      return [];
    }
  };

  const getUpcomingSpecialDays = async (limit = 10): Promise<SpecialDay[]> => {
    try {
      const response = await fetch(`${API_URL}/api/special-days/upcoming?limit=${limit}`);
      const result: ApiResponse<SpecialDay[]> = await response.json();
      return result.success && result.data ? result.data : [];
    } catch {
      return [];
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setLanguage,
        setDarkMode,
        fetchToday,
        getCalendarByDate,
        getSpecialDays,
        getUpcomingSpecialDays,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
