import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { VerifactuPrismaService } from '../services/verifactu-prisma.service';

@Injectable()
export class VerifactuApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: VerifactuPrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.VERIFACTU_REQUIRE_API_KEY !== 'true') {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined>; body?: { tenantId?: string } }>();
    const apiKeyHeader = req.headers['x-api-key'];
    const tenantId = req.body?.tenantId;
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
    if (!apiKey || !tenantId) throw new UnauthorizedException('Missing x-api-key or tenantId');

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

