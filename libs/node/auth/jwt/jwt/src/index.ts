/**
 * JWT Authentication Library
 * 
 * Provides JWT authentication guard, strategy, and service.
 * 
 * Usage:
 * ```typescript
 * import { JwtAuthGuard, JwtStrategy, JwtService } from '@josanz-erp/auth-jwt';
 * 
 * @UseGuards(JwtAuthGuard)
 * @Get('protected')
 * getProtected() {}
 * ```
 */

// Guards
export { JwtAuthGuard, JWT_AUTH_GUARD } from './lib/guards/jwt-auth.guard';

// Strategies
export { JwtStrategy, JwtPayload, JwtUser } from './lib/strategies/jwt.strategy';

// Services
export { JwtService } from './lib/services/jwt.service';
