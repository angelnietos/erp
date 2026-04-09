/**
 * UUID Generation Utilities
 * Provides functions for generating and validating UUIDs
 */

/**
 * Generates a new UUID v4
 * @returns A UUID v4 string
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Generates a new UUID v4 with a custom prefix
 * @param prefix - The prefix to add to the UUID
 * @returns A UUID string with the prefix
 */
export function generatePrefixedUuid(prefix: string): string {
  const uuid = generateUuid();
  return `${prefix}_${uuid}`;
}

/**
 * Validates if a string is a valid UUID
 * @param uuid - The string to validate
 * @returns True if the string is a valid UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates if a string is a valid prefixed UUID
 * @param prefixedUuid - The string to validate
 * @param prefix - The expected prefix
 * @returns True if the string is a valid prefixed UUID
 */
export function isValidPrefixedUuid(prefixedUuid: string, prefix: string): boolean {
  const pattern = `^${prefix}_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`;
  const regex = new RegExp(pattern, 'i');
  return regex.test(prefixedUuid);
}

/**
 * Extracts the prefix from a prefixed UUID
 * @param prefixedUuid - The prefixed UUID string
 * @returns The prefix or null if invalid
 */
export function extractPrefix(prefixedUuid: string): string | null {
  const parts = prefixedUuid.split('_');
  if (parts.length !== 2 || !isValidUuid(parts[1])) {
    return null;
  }
  return parts[0];
}

/**
 * Extracts the UUID portion from a prefixed UUID
 * @param prefixedUuid - The prefixed UUID string
 * @returns The UUID or null if invalid
 */
export function extractUuid(prefixedUuid: string): string | null {
  const parts = prefixedUuid.split('_');
  if (parts.length !== 2 || !isValidUuid(parts[1])) {
    return null;
  }
  return parts[1];
}
