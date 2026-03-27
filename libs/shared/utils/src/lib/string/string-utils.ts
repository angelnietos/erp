/**
 * String Utilities
 * Provides functions for common string operations
 */

/**
 * Trims whitespace from both ends of a string
 * @param value - String to trim
 * @returns Trimmed string
 */
export function trim(value: string): string {
  return value.trim();
}

/**
 * Capitalizes the first letter of a string
 * @param value - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Capitalizes the first letter of each word in a string
 * @param value - String to title case
 * @returns Title cased string
 */
export function titleCase(value: string): string {
  return value
    .split(' ')
    .map(word => capitalize(word.toLowerCase()))
    .join(' ');
}

/**
 * Converts a string to camelCase
 * @param value - String to convert
 * @returns Camel cased string
 */
export function camelCase(value: string): string {
  return value
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toLowerCase());
}

/**
 * Converts a string to snake_case
 * @param value - String to convert
 * @returns Snake cased string
 */
export function snakeCase(value: string): string {
  return value
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Converts a string to kebab-case
 * @param value - String to convert
 * @returns Kebab cased string
 */
export function kebabCase(value: string): string {
  return value
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * Converts a string to PascalCase
 * @param value - String to convert
 * @returns Pascal cased string
 */
export function pascalCase(value: string): string {
  return value
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase());
}

/**
 * Converts a string to slug format
 * @param value - String to slugify
 * @returns Slugified string
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '-')
    .trim();
}

/**
 * Truncates a string to a specified length
 * @param value - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add if truncated (default: '...')
 * @returns Truncated string
 */
export function truncate(value: string, maxLength: number, suffix = '...'): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Pads a string with characters on the left
 * @param value - String to pad
 * @param length - Target length
 * @param char - Character to use for padding
 * @returns Padded string
 */
export function padLeft(value: string, length: number, char = ' '): string {
  return value.padStart(length, char);
}

/**
 * Pads a string with characters on the right
 * @param value - String to pad
 * @param length - Target length
 * @param char - Character to use for padding
 * @returns Padded string
 */
export function padRight(value: string, length: number, char = ' '): string {
  return value.padEnd(length, char);
}

/**
 * Repeats a string a specified number of times
 * @param value - String to repeat
 * @param count - Number of times to repeat
 * @returns Repeated string
 */
export function repeat(value: string, count: number): string {
  return value.repeat(count);
}

/**
 * Reverses a string
 * @param value - String to reverse
 * @returns Reversed string
 */
export function reverse(value: string): string {
  return value.split('').reverse().join('');
}

/**
 * Checks if a string contains a substring (case-insensitive)
 * @param value - String to check
 * @param substring - Substring to look for
 * @returns True if contains
 */
export function contains(value: string, substring: string): boolean {
  return value.toLowerCase().includes(substring.toLowerCase());
}

/**
 * Checks if a string starts with a substring
 * @param value - String to check
 * @param prefix - Prefix to check for
 * @returns True if starts with
 */
export function startsWith(value: string, prefix: string): boolean {
  return value.startsWith(prefix);
}

/**
 * Checks if a string ends with a substring
 * @param value - String to check
 * @param suffix - Suffix to check for
 * @returns True if ends with
 */
export function endsWith(value: string, suffix: string): boolean {
  return value.endsWith(suffix);
}

/**
 * Removes all whitespace from a string
 * @param value - String to remove whitespace from
 * @returns String without whitespace
 */
export function removeWhitespace(value: string): string {
  return value.replace(/\s+/g, '');
}

/**
 * Removes diacritical marks from a string (accents)
 * @param value - String to normalize
 * @returns String without diacritical marks
 */
export function removeAccents(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Generates a random string of specified length
 * @param length - Length of the random string
 * @param chars - Character set to use (default: alphanumeric)
 * @returns Random string
 */
export function randomString(length: number, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Extracts numbers from a string
 * @param value - String to extract numbers from
 * @returns Array of numbers found
 */
export function extractNumbers(value: string): number[] {
  const matches = value.match(/\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Masks a string with a character (useful for hiding sensitive data)
 * @param value - String to mask
 * @param visibleChars - Number of visible characters at start/end
 * @param maskChar - Character to use for masking (default: '*')
 * @returns Masked string
 */
export function mask(value: string, visibleChars = 4, maskChar = '*'): string {
  if (value.length <= visibleChars * 2) return value;
  const start = value.slice(0, visibleChars);
  const end = value.slice(-visibleChars);
  const masked = maskChar.repeat(value.length - visibleChars * 2);
  return start + masked + end;
}

/**
 * Pads a string with zeros on the left
 * @param value - String or number to pad
 * @param length - Target length
 * @returns Padded string
 */
export function padWithZeros(value: string | number, length: number): string {
  return String(value).padStart(length, '0');
}