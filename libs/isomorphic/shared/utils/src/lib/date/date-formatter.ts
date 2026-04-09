/**
 * Date Formatting Utilities
 * Provides functions for formatting dates in various formats
 */

/**
 * Supported date formats
 */
export type DateFormat = 
  | 'ISO' 
  | 'ISO_SHORT' 
  | 'DATE_ONLY' 
  | 'TIME_ONLY' 
  | 'DATETIME' 
  | 'DATETIME_SHORT'
  | 'HUMAN_DATE'
  | 'HUMAN_DATETIME'
  | 'EUROPEAN';

/**
 * Formats a date as ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param date - Date to format
 * @returns ISO formatted string
 */
export function formatISO(date: Date): string {
  return date.toISOString();
}

/**
 * Formats a date as ISO short (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO short formatted string
 */
export function formatISOShort(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formats a date as date only (DD/MM/YYYY)
 * @param date - Date to format
 * @returns Date only formatted string
 */
export function formatDateOnly(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats a date as time only (HH:mm:ss)
 * @param date - Date to format
 * @returns Time only formatted string
 */
export function formatTimeOnly(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a date as datetime (DD/MM/YYYY HH:mm:ss)
 * @param date - Date to format
 * @returns Datetime formatted string
 */
export function formatDatetime(date: Date): string {
  return `${formatDateOnly(date)} ${formatTimeOnly(date)}`;
}

/**
 * Formats a date as short datetime (DD/MM/YYYY HH:mm)
 * @param date - Date to format
 * @returns Short datetime formatted string
 */
export function formatDatetimeShort(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Formats a date in human readable format (e.g., "January 1, 2024")
 * @param date - Date to format
 * @returns Human readable formatted string
 */
export function formatHumanDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date in human readable format with time (e.g., "January 1, 2024 at 10:30")
 * @param date - Date to format
 * @returns Human readable datetime formatted string
 */
export function formatHumanDatetime(date: Date): string {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date in European format (DD-MM-YYYY)
 * @param date - Date to format
 * @returns European formatted string
 */
export function formatEuropean(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Formats a date using a specified format
 * @param date - Date to format
 * @param format - The format to use
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: DateFormat): string {
  switch (format) {
    case 'ISO':
      return formatISO(date);
    case 'ISO_SHORT':
      return formatISOShort(date);
    case 'DATE_ONLY':
      return formatDateOnly(date);
    case 'TIME_ONLY':
      return formatTimeOnly(date);
    case 'DATETIME':
      return formatDatetime(date);
    case 'DATETIME_SHORT':
      return formatDatetimeShort(date);
    case 'HUMAN_DATE':
      return formatHumanDate(date);
    case 'HUMAN_DATETIME':
      return formatHumanDatetime(date);
    case 'EUROPEAN':
      return formatEuropean(date);
    default:
      return formatISO(date);
  }
}

/**
 * Formats a duration in milliseconds to human readable (e.g., "2h 30m 15s")
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

  return parts.join(' ') || '0s';
}

/**
 * Formats a relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to format relative to now
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  const absDiff = Math.abs(diff);
  
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diff > 0) {
    if (days > 0) return `en ${days} días`;
    if (hours > 0) return `en ${hours} horas`;
    if (minutes > 0) return `en ${minutes} minutos`;
    if (seconds > 0) return `en ${seconds} segundos`;
  } else {
    if (days > 0) return `hace ${days} días`;
    if (hours > 0) return `hace ${hours} horas`;
    if (minutes > 0) return `hace ${minutes} minutos`;
    if (seconds > 0) return `hace ${seconds} segundos`;
  }
  
  return 'ahora';
}
