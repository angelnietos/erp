import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class CrmErpWebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret =
      process.env.CRM_ERP_WEBHOOK_SECRET?.trim() ||
      process.env.CRM_ERP_SYNC_API_KEY?.trim();
    if (!secret) {
      throw new UnauthorizedException('CRM_ERP_WEBHOOK_SECRET is not configured');
    }

    const req = context.switchToHttp().getRequest<{
      body: {
        eventType?: string;
        tenantId?: string;
        invoiceId?: string;
        payload?: Record<string, unknown>;
      };
      headers: Record<string, string | string[] | undefined>;
    }>();

    const rawSig = req.headers['x-verifactu-signature'];
    const signature = (Array.isArray(rawSig) ? rawSig[0] : rawSig)?.trim();
    if (!signature) {
      throw new UnauthorizedException('Missing X-Verifactu-Signature');
    }

    const { eventType, tenantId, invoiceId, payload } = req.body ?? {};
    if (!eventType || !tenantId || !invoiceId || payload === undefined) {
      throw new UnauthorizedException('Invalid webhook payload');
    }

    const body = JSON.stringify({ eventType, tenantId, invoiceId, payload });
    const expected = createHmac('sha256', secret).update(body).digest('hex');
    if (signature !== expected) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
