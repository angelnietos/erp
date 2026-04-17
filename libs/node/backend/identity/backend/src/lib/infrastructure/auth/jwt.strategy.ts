import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions?: string[];
  tenantId?: string;
  /** Panel SaaS (sin tenant cliente). */
  kind?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'default_secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return {
      id: payload.sub,
      sub: payload.sub,
      email: payload.email,
      roles: Array.isArray(payload.roles)
        ? payload.roles.filter((x): x is string => typeof x === 'string')
        : [],
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.filter((x): x is string => typeof x === 'string')
        : [],
      tenantId: payload.tenantId,
      kind: payload.kind,
    };
  }
}
