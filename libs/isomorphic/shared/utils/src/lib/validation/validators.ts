/**
 * Validation Utilities
 * Provides functions for validating common data types
 */

/**
 * Validates an email address
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a URL
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a phone number (Spanish format)
 * @param phone - Phone number to validate
 * @returns True if valid Spanish phone number
 */
export function isValidPhone(phone: string): boolean {
  const spanishPhoneRegex = /^(?:\+34|0034|34)?[6-9]\d{8}$/;
  return spanishPhoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validates a NIF (Spanish personal ID)
 * @param nif - NIF to validate
 * @returns True if valid NIF
 */
export function isValidNif(nif: string): boolean {
  const nifRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
  const cleanNif = nif.toUpperCase().trim();
  return nifRegex.test(cleanNif) || nieRegex.test(cleanNif);
}

/**
 * Validates a CIF (Spanish company ID)
 * @param cif - CIF to validate
 * @returns True if valid CIF
 */
export function isValidCif(cif: string): boolean {
  const cifRegex = /^[A-Z][0-9]{8}$/;
  return cifRegex.test(cif.toUpperCase().trim());
}

/**
 * Validates an IBAN (International Bank Account Number)
 * @param iban - IBAN to validate
 * @returns True if valid IBAN
 */
export function isValidIban(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleaned)) return false;
  
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? String(code - 55) : char;
    })
    .join('');
  
  // Mod97 calculation using number instead of BigInt
  let mod = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const part = parseInt(mod.toString() + numeric.slice(i, i + 7), 10);
    mod = part % 97;
  }
  
  return mod === 1;
}

/**
 * Validates a credit card number (Luhn algorithm)
 * @param cardNumber - Card number to validate
 * @returns True if valid credit card number
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validates a password strength
 * @param password - Password to validate
 * @returns True if password meets minimum requirements
 */
export function isStrongPassword(password: string): boolean {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Validates a postal code (Spanish)
 * @param postalCode - Postal code to validate
 * @returns True if valid Spanish postal code
 */
export function isValidPostalCode(postalCode: string): boolean {
  const spanishPostalCodeRegex = /^(0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/;
  return spanishPostalCodeRegex.test(postalCode);
}

/**
 * Validates a number is within a range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates a string length
 * @param value - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if length is valid
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Validates alphanumeric string
 * @param value - String to validate
 * @returns True if only alphanumeric characters
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Validates numeric string
 * @param value - String to validate
 * @returns True if only numeric characters
 */
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Validates alphabetic string
 * @param value - String to validate
 * @returns True if only alphabetic characters
 */
export function isAlpha(value: string): boolean {
  return /^[a-zA-Z]+$/.test(value);
}

/**
 * Checks if a value is empty (null, undefined, or empty string)
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
}

/**
 * Validates array is not empty
 * @param value - Array to validate
 * @returns True if array has elements
 */
export function isNotEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Validates date is valid
 * @param date - Date to validate
 * @returns True if valid date
 */
export function isValidDateValue(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
