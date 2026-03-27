import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Port interface for API Key validation.
 * Implement this to create custom API key validation logic.
 */
export interface ApiKeyValidator {
  validateKey(apiKey: string, tenantId?: string): Promise<boolean>;
}

/**
 * API Key Guard Options
 */
export interface ApiKeyGuardOptions {
  /** Header name containing the API key (default: x-api-key) */
  headerName?: string;
  /** Whether API key validation is required (default: true) */
  required?: boolean;
  /** Optional required scope */
  requiredScope?: string;
  /** Custom validator function */
  validator?: ApiKeyValidator;
}

/**
 * API Key Authentication Guard
 * 
 * Validates API keys from request headers.
 * 
 * Usage:
 * ```typescript
 * @UseGuards(ApiKeyGuard)
 * @Controller('api')
 * export class ApiController {}
 * ```
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly headerName: string;
  private readonly required: boolean;
  private readonly requiredScope?: string;
  private readonly validator?: ApiKeyValidator;

  constructor(options: ApiKeyGuardOptions = {}) {
    this.headerName = options.headerName ?? 'x-api-key';
    this.required = options.required ?? true;
    this.requiredScope = options.requiredScope;
    this.validator = options.validator;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      body?: Record<string, unknown>;
    }>();

    const apiKeyHeader = req.headers[this.headerName];
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

    // If API key is optional and not provided, allow access
    if (!this.required && !apiKey) {
      return true;
    }

    if (!apiKey) {
      throw new UnauthorizedException(`Missing ${this.headerName} header`);
    }

    // If custom validator is provided, use it
    if (this.validator) {
      const tenantId = req.body?.tenantId as string | undefined;
      const isValid = await this.validator.validateKey(apiKey, tenantId);
      if (!isValid) {
        throw new UnauthorizedException('Invalid API key');
      }
      return true;
    }

    // Default: validate basic format (placeholder for custom implementations)
    // In production, implement database lookup for API key validation
    if (apiKey.length < 16) {
      throw new UnauthorizedException('Invalid API key format');
    }

    return true;
  }
}

/**
 * Utility to hash API keys for secure storage
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/** Token for dependency injection */
export const API_KEY_GUARD = Symbol('API_KEY_GUARD');
