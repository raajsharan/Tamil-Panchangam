export interface ITamilDate {
  year: number;
  yearName: string;
  month: string;
  day: number;
}

export interface ITithi {
  name: string;
  number: number;
  paksha: 'Shukla' | 'Krishna';
  start: Date;
  end: Date;
}

export interface INakshatram {
  name: string;
  lord: string;
  pada?: number;
}

export interface IYoga {
  name: string;
  number: number;
}

export interface IKarana {
  name: string;
}

export interface IMuhurtas {
  sunrise: Date;
  sunset: Date;
  moonrise?: Date;
  moonset?: Date;
  rahuKalam: { start: Date; end: Date };
  yamagandam: { start: Date; end: Date };
  kuligai: { start: Date; end: Date };
  abhijit?: { start: Date; end: Date };
  brahmaMuhurta?: { start: Date; end: Date };
}

export interface ISpecialDay {
  id?: string;
  name: string;
  nameTamil?: string;
  nameEnglish?: string;
  type: 'major' | 'minor' | 'regional' | 'national';
  category?: string;
  date: Date;
}

export interface ICalendarEntry {
  _id?: string;
  date: Date;
  tamilDate: ITamilDate;
  tithi: ITithi;
  nakshatram: INakshatram;
  yoga?: IYoga;
  karana?: IKarana;
  muhurtas: IMuhurtas;
  specialDays: ISpecialDay[];
  isManualOverride: boolean;
  isVerified: boolean;
  hasError: boolean;
  errorMessage?: string;
  source: 'calculated' | 'scraped' | 'manual';
  scrapedFrom?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin {
  _id?: string;
  email: string;
  password: string;
  role: 'super-admin' | 'editor';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id?: string;
  type: 'info' | 'warning' | 'error' | 'scrape' | 'system' | 'auth';
  message: string;
  metadata?: Record<string, unknown>;
  calendarId?: string;
  adminId?: string;
  createdAt: Date;
}

export interface IScraperStatus {
  _id?: string;
  source: string;
  lastRun: Date;
  status: 'success' | 'failed' | 'partial';
  recordsProcessed: number;
  errors: string[];
  nextRun: Date;
  avgResponseTime?: number;
  successRate?: number;
  updatedAt: Date;
}

export interface ITelegramSubscriber {
  _id?: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  language: 'en' | 'ta';
  subscribed: boolean;
  notificationsEnabled: boolean;
  lastInteraction: Date;
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISystemSetting {
  _id?: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
