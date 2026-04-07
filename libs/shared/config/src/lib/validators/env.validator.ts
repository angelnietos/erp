/**
 * Environment Variable Validator
 * Validates required environment variables at application startup
 */

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  variable: string;
  message: string;
  currentValue?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  variable: string;
  message: string;
  currentValue?: string;
}

/**
 * Environment variable schema definition
 */
export interface EnvSchema {
  name: string;
  required: boolean;
  default?: string;
  type: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'enum';
  allowedValues?: string[];
  validator?: (value: string) => boolean;
  min?: number;
  max?: number;
}

// Inline validators
function isValidUrlInline(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidEmailInline(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Common environment variable schemas
 */
export const COMMON_SCHEMA: EnvSchema[] = [
  {
    name: 'NODE_ENV',
    required: true,
    type: 'enum',
    allowedValues: ['development', 'staging', 'production', 'test'],
    default: 'development',
  },
  {
    name: 'PORT',
    required: false,
    type: 'number',
    default: '3000',
    min: 1,
    max: 65535,
  },
  {
    name: 'DATABASE_URL',
    required: true,
    type: 'string',
  },
  {
    name: 'JWT_SECRET',
    required: true,
    type: 'string',
  },
  {
    name: 'API_URL',
    required: false,
    type: 'url',
  },
];

/**
 * Validate environment variables
 */
export function validateEnv(schema: EnvSchema[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const envVar of schema) {
    const value = process.env[envVar.name];
    const hasValue = value !== undefined && value !== '';

    if (envVar.required && !hasValue) {
      if (envVar.default !== undefined) {
        warnings.push({
          variable: envVar.name,
          message: `Required variable not set, using default: ${envVar.default}`,
          currentValue: envVar.default,
        });
      } else {
        errors.push({
          variable: envVar.name,
          message: 'Required environment variable is not set',
        });
      }
      continue;
    }

    if (!hasValue) {
      continue;
    }

    let isValid = true;
    const stringValue = value!;

    switch (envVar.type) {
      case 'number': {
        const numValue = parseInt(stringValue, 10);
        if (isNaN(numValue)) {
          errors.push({
            variable: envVar.name,
            message: 'Must be a valid number',
            currentValue: stringValue,
          });
          isValid = false;
        } else if (envVar.min !== undefined && numValue < envVar.min) {
          errors.push({
            variable: envVar.name,
            message: `Must be at least ${envVar.min}`,
            currentValue: stringValue,
          });
          isValid = false;
        } else if (envVar.max !== undefined && numValue > envVar.max) {
          errors.push({
            variable: envVar.name,
            message: `Must be at most ${envVar.max}`,
            currentValue: stringValue,
          });
          isValid = false;
        }
        break;
      }

      case 'boolean': {
        if (!['true', 'false', '0', '1'].includes(stringValue.toLowerCase())) {
          errors.push({
            variable: envVar.name,
            message: 'Must be a valid boolean (true/false)',
            currentValue: stringValue,
          });
          isValid = false;
        }
        break;
      }

      case 'url': {
        if (!isValidUrlInline(stringValue)) {
          errors.push({
            variable: envVar.name,
            message: 'Must be a valid URL',
            currentValue: stringValue,
          });
          isValid = false;
        }
        break;
      }

      case 'email': {
        if (!isValidEmailInline(stringValue)) {
          errors.push({
            variable: envVar.name,
            message: 'Must be a valid email address',
            currentValue: stringValue,
          });
          isValid = false;
        }
        break;
      }

      case 'enum': {
        if (envVar.allowedValues && !envVar.allowedValues.includes(stringValue)) {
          errors.push({
            variable: envVar.name,
            message: `Must be one of: ${envVar.allowedValues.join(', ')}`,
            currentValue: stringValue,
          });
          isValid = false;
        }
        break;
      }
    }

    if (isValid && envVar.validator && !envVar.validator(stringValue)) {
      errors.push({
        variable: envVar.name,
        message: 'Failed custom validation',
        currentValue: stringValue,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and throw on errors
 */
export function validateEnvOrThrow(schema: EnvSchema[]): void {
  const result = validateEnv(schema);

  if (!result.valid) {
    const errorMessages = result.errors.map(e => `${e.variable}: ${e.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  if (result.warnings.length > 0) {
    console.warn('Environment variable warnings:');
    result.warnings.forEach(w => console.warn(`  - ${w.variable}: ${w.message}`));
  }
}

/**
 * Get validated environment variable
 */
export function getEnv(name: string, schema: EnvSchema): string {
  const value = process.env[name];

  if (value !== undefined && value !== '') {
    return value;
  }

  if (schema.default !== undefined) {
    return schema.default;
  }

  return '';
}

/**
 * Get validated number environment variable
 */
export function getEnvNumber(name: string, schema: EnvSchema): number {
  const value = getEnv(name, schema);
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return schema.default ? parseInt(schema.default, 10) : 0;
  }

  return parsed;
}

/**
 * Get validated boolean environment variable
 */
export function getEnvBoolean(name: string, schema: EnvSchema): boolean {
  const value = getEnv(name, schema);
  return value.toLowerCase() === 'true' || value === '1';
}