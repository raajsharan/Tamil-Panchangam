import { ICalendarEntry } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: ICalendarEntry;
}

export function validateCalendarData(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid data format'] };
  }

  const entry = data as Record<string, unknown>;

  // Check required date field
  if (!entry.date) {
    errors.push('Date is required');
  }

  // Check tamilDate
  if (!entry.tamilDate || typeof entry.tamilDate !== 'object') {
    errors.push('Tamil date is required');
  } else {
    const tamilDate = entry.tamilDate as Record<string, unknown>;
    if (!tamilDate.year) errors.push('Tamil year is required');
    if (!tamilDate.month) errors.push('Tamil month is required');
    if (!tamilDate.day) errors.push('Tamil day is required');
  }

  // Check tithi
  if (!entry.tithi || typeof entry.tithi !== 'object') {
    errors.push('Tithi is required');
  } else {
    const tithi = entry.tithi as Record<string, unknown>;
    if (!tithi.name) errors.push('Tithi name is required');
    if (typeof tithi.number !== 'number') errors.push('Tithi number must be a number');
    if (!tithi.paksha) errors.push('Tithi paksha is required');
  }

  // Check nakshatram
  if (!entry.nakshatram || typeof entry.nakshatram !== 'object') {
    errors.push('Nakshatram is required');
  } else {
    const nakshatram = entry.nakshatram as Record<string, unknown>;
    if (!nakshatram.name) errors.push('Nakshatram name is required');
    if (!nakshatram.lord) errors.push('Nakshatram lord is required');
  }

  // Check muhurtas
  if (!entry.muhurtas || typeof entry.muhurtas !== 'object') {
    errors.push('Muhurtas is required');
  } else {
    const muhurtas = entry.muhurtas as Record<string, unknown>;
    if (!muhurtas.sunrise) errors.push('Sunrise time is required');
    if (!muhurtas.sunset) errors.push('Sunset time is required');
    if (!muhurtas.rahuKalam) errors.push('Rahu Kalam is required');
    if (!muhurtas.yamagandam) errors.push('Yamagandam is required');
    if (!muhurtas.kuligai) errors.push('Kuligai is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as ICalendarEntry) : undefined
  };
}

export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
