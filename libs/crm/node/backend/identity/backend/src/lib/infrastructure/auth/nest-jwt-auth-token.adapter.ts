import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  AccessTokenClaims,
  AuthTokenPort,
} from '@generic-crm/identity-core';

@Injectable()
export class NestJwtAuthTokenAdapter implements AuthTokenPort {
  constructor(private readonly jwt: JwtService) {}

  signAccessToken(claims: AccessTokenClaims): Promise<string> {
    console.log('signAccessToken', claims);
    return this.jwt.signAsync(claims);
  }
}
