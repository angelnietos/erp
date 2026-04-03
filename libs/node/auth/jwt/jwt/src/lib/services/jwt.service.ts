import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

/**
 * JWT Service for token operations
 * 
 * Provides token generation and validation.
 * 
 * Usage:
 * ```typescript
 * @Injectable()
 * class AuthService {
 *   constructor(private jwtService: JwtService) {}
 *   
 *   generateToken(user: JwtUser) {
 *     return this.jwtService.sign({ sub: user.userId, email: user.email, roles: user.roles });
 *   }
 * }
 * ```
 */
@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  /**
   * Generate a JWT token
   */
  sign(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  /**
   * Verify and decode a JWT token
   */
  verify(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  /**
   * Decode a JWT token without verification (for reading payload)
   */
  decode(token: string): JwtPayload | null {
    return this.jwtService.decode(token);
  }
}
