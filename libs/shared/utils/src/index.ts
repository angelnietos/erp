/**
 * Shared Utils Library
 * Provides utility functions for the ERP application
 */

// Crypto (solo Web Crypto / sin módulo `crypto` de Node — apto para Angular)
export * from './lib/crypto/uuid';

// Date utilities
export * from './lib/date/date-utils';
export * from './lib/date/date-formatter';

// String utilities
export * from './lib/string/string-utils';

// Validation utilities
export * from './lib/validation/validators';

// Browser (solo entorno cliente)
export * from './lib/browser/print-html';