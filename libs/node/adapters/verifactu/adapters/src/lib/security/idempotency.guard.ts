import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

type HttpReq = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
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
export class IdempotencyGuard implements CanActivate {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.VERIFACTU_IDEMPOTENCY_ENABLED !== 'true') {
      return true;
    }

    const req = context.switchToHttp().getRequest<HttpReq>();
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return true;
    }

    const idempotencyKey = headerOne(req, 'idempotency-key');
    if (!idempotencyKey) {
      return true; // No key provided, skip idempotency check
    }

    const tenantId = headerOne(req, 'x-tenant-id')?.trim();
    if (!tenantId || !isTenantUuid(tenantId)) {
      return true;
    }

    // Hash the request body for comparison
    const requestHash = createHash('sha256')
      .update(JSON.stringify(req.body ?? {}))
      .digest('hex');

    // Check if this key was already processed
    const existing = await this.prisma.idempotencyKey.findFirst({
      where: {
        tenantId,
        key: idempotencyKey,
      },
    });

    if (existing && existing.status === 'COMPLETED') {
      // Attach cached response to request for controller reuse
      (req as unknown as { __idempotencyResponse?: unknown }).__idempotencyResponse =
        existing.response;
      return true;
    }

    // Store pending idempotency record
    await this.prisma.idempotencyKey.upsert({
      where: {
        uq_idempotency_tenant_key: {
          tenantId,
          key: idempotencyKey,
        },
      },
      create: {
        tenantId,
        key: idempotencyKey,
        requestHash,
        response: {},
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
      },
      update: {
        requestHash,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return true;
  }
}