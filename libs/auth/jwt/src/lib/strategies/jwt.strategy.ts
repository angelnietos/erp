import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  userId: string;
  email: string;
  roles: string[];
}

/**
 * JWT Strategy for Passport
 * 
 * Extracts and validates JWT tokens from Authorization header.
 * 
 * Usage:
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { JwtStrategy } from '@josanz-erp/auth-jwt';
 * import { PassportModule } from '@nestjs/passport';
 * 
 * @Module({
 *   imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
 *   providers: [JwtStrategy],
 * })
 * export class AuthModule {}
 * ```
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'default_secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
    };
  }
}
