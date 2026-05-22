import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** Solo JWT emitidos para el panel SaaS (`kind: 'platform'` en el payload). */
@Injectable()
export class PlatformJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      user?: { kind?: string };
    }>();
    if (req.user?.kind !== 'platform') {
      throw new ForbiddenException('Sesión de plataforma requerida.');
    }
    return true;
  }
}
