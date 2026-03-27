/**
 * Date Utilities
 * Provides functions for common date operations
 */

/**
 * Returns the current date as a Date object
 * @returns Current date
 */
export function now(): Date {
  return new Date();
}

/**
 * Returns the current timestamp in milliseconds
 * @returns Current timestamp
 */
export function nowTimestamp(): number {
  return Date.now();
}

/**
 * Creates a date from year, month, day
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @returns Date object
 */
export function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

/**
 * Adds days to a date
 * @param date - The source date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adds months to a date
 * @param date - The source date
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Adds years to a date
 * @param date - The source date
 * @param years - Number of years to add (can be negative)
 * @returns New date with years added
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Gets the start of the day for a given date
 * @param date - The source date
 * @returns Date at 00:00:00.000
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the end of the day for a given date
 * @param date - The source date
 * @returns Date at 23:59:59.999
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Gets the start of the month for a given date
 * @param date - The source date
 * @returns First day of the month at 00:00:00.000
 */
export function startOfMonth(date: Date): Date {
  return createDate(date.getFullYear(), date.getMonth() + 1, 1);
}

/**
 * Gets the end of the month for a given date
 * @param date - The source date
 * @returns Last day of the month at 23:59:59.999
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfDay(result);
}

/**
 * Gets the start of the year for a given date
 * @param date - The source date
 * @returns January 1st of the year at 00:00:00.000
 */
export function startOfYear(date: Date): Date {
  return createDate(date.getFullYear(), 1, 1);
}

/**
 * Gets the end of the year for a given date
 * @param date - The source date
 * @returns December 31st of the year at 23:59:59.999
 */
export function endOfYear(date: Date): Date {
  const result = createDate(date.getFullYear(), 12, 31);
  return endOfDay(result);
}

/**
 * Checks if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Checks if a date is in the past
 * @param date - Date to check
 * @returns True if date is before now
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Checks if a date is in the future
 * @param date - Date to check
 * @returns True if date is after now
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Calculates the difference in days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates (can be negative)
 */
export function differenceInDays(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((date1.getTime() - date2.getTime()) / msPerDay);
}

/**
 * Calculates the difference in business days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of business days between dates
 */
export function differenceInBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Parses a date string in ISO format
 * @param dateString - ISO date string
 * @returns Date object or null if invalid
 */
export function parseISO(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Checks if a date is valid
 * @param date - Date to check
 * @returns True if valid date
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}