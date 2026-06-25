import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ErpInternalSyncApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env['CRM_ERP_SYNC_API_KEY']?.trim();
    if (!expected) {
      throw new UnauthorizedException('CRM_ERP_SYNC_API_KEY is not configured');
    }

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const raw = req.headers['x-api-key'];
    const apiKey = (Array.isArray(raw) ? raw[0] : raw)?.trim();
    if (!apiKey || apiKey !== expected) {
      throw new UnauthorizedException('Invalid sync API key');
    }
    return true;
  }
}
