/**
 * Auth API Key Library
 * 
 * Provides API key authentication guard for request validation.
 * 
 * Usage:
 * ```typescript
 * import { ApiKeyGuard } from '@josanz-erp/auth-api-key';
 * 
 * @UseGuards(ApiKeyGuard)
 * @Controller('external')
 * export class ExternalController {}
 * ```
 */

// Guards
export { ApiKeyGuard, ApiKeyGuardOptions, ApiKeyValidator, API_KEY_GUARD, hashApiKey } from './lib/guards/api-key.guard';
