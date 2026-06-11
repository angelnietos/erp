import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** Solo JWT emitidos para el panel SaaS (`kind: 'platform'` en el payload)
 * o tokens Keycloak con roles PlatformOwner/PlatformAdmin.
 */
@Injectable()
export class PlatformJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      user?: { kind?: string; roles?: string[] };
    }>();
    const isPlatform = req.user?.kind === 'platform' ||
      req.user?.roles?.some(r => ['PlatformOwner', 'PlatformAdmin'].includes(r));
    if (!isPlatform) {
      throw new ForbiddenException('Sesión de plataforma requerida.');
    }
    return true;
  }
}
