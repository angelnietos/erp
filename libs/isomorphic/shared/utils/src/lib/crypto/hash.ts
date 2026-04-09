/**
 * Hash Generation Utilities
 * Provides functions for generating various hashes
 */

import { createHash, randomBytes } from 'crypto';

/**
 * Supported hash algorithms
 */
export type HashAlgorithm = 'sha256' | 'sha512' | 'md5';

/**
 * Generates a SHA-256 hash of the input string
 * @param input - The string to hash
 * @returns A hexadecimal hash string
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Generates a SHA-512 hash of the input string
 * @param input - The string to hash
 * @returns A hexadecimal hash string
 */
export function sha512(input: string): string {
  return createHash('sha512').update(input, 'utf8').digest('hex');
}

/**
 * Generates an MD5 hash of the input string
 * @param input - The string to hash
 * @returns A hexadecimal hash string
 */
export function md5(input: string): string {
  return createHash('md5').update(input, 'utf8').digest('hex');
}

/**
 * Generates a hash using the specified algorithm
 * @param input - The string to hash
 * @param algorithm - The hash algorithm to use
 * @returns A hexadecimal hash string
 */
export function hash(input: string, algorithm: HashAlgorithm): string {
  return createHash(algorithm).update(input, 'utf8').digest('hex');
}

/**
 * Generates a random secure token
 * @param length - The length of the token in bytes (default: 32)
 * @returns A base64 encoded random token
 */
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('base64url');
}

/**
 * Generates a random hex string
 * @param length - The length of the hex string in bytes (default: 32)
 * @returns A hexadecimal random string
 */
export function generateRandomHex(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generates a hash for HMAC-based operations
 * @param input - The string to hash
 * @param key - The secret key
 * @param algorithm - The hash algorithm to use (default: sha256)
 * @returns A hexadecimal hash string
 */
export function hmac(input: string, key: string, algorithm: HashAlgorithm = 'sha256'): string {
  const crypto = require('crypto');
  return crypto.createHmac(algorithm, key).update(input, 'utf8').digest('hex');
}
