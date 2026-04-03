import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

type HttpReq = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: { tenantId?: string };
  query?: Record<string, unknown>;
};

function headerOne(req: HttpReq, name: string): string | undefined {
  const v = req.headers[name.toLowerCase()];
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

const TENANT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isTenantUuid(value: string): boolean {
  return TENANT_UUID_RE.test(value.trim());
}

@Injectable()
export class VerifactuApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.VERIFACTU_REQUIRE_API_KEY !== 'true') {
      return true;
    }

    const req = context.switchToHttp().getRequest<HttpReq>();
    if (req.method === 'OPTIONS' || req.method === 'HEAD') {
      return true;
    }

    const apiKeyHeader = headerOne(req, 'x-api-key');
    const tenantIdRaw =
      (req.body && typeof req.body === 'object' && 'tenantId' in req.body
        ? (req.body as { tenantId?: string }).tenantId
        : undefined) ??
      (typeof req.query?.['tenantId'] === 'string' ? req.query['tenantId'] : undefined) ??
      headerOne(req, 'x-tenant-id');

    const tenantId = tenantIdRaw?.trim() || undefined;
    const apiKey = apiKeyHeader?.trim() || undefined;
    if (!apiKey || !tenantId) throw new UnauthorizedException('Missing x-api-key or tenantId');
    if (!isTenantUuid(tenantId)) {
      throw new UnauthorizedException(
        'tenantId must be the tenant UUID from login, not a code or slug (e.g. not TENANT-PRO-2026).',
      );
    }

    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const key = await this.prisma.tenantApiKey.findFirst({
      where: {
        tenantId,
        keyHash,
        isActive: true,
        scopes: { has: 'invoice.submit' },
      },
    });
    if (!key) throw new UnauthorizedException('Invalid API key or scope');

    return true;
  }
}

