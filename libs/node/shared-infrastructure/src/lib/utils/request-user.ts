import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

/** Usuario autenticado vía JwtStrategy (Passport). */
export function requireRequestUserId(req: Request): string {
  const u = req.user as { sub?: string; id?: string } | undefined;
  const id = u?.sub ?? u?.id;
  if (!id || typeof id !== 'string') {
    throw new BadRequestException('Missing authenticated user');
  }
  return id;
}
