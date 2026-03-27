import { DomainError } from './domain-error';

/**
 * Validation Error - thrown when domain validation fails.
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    details?: Record<string, any>,
  ) {
    super(message, 'VALIDATION_ERROR', details);
  }
}
