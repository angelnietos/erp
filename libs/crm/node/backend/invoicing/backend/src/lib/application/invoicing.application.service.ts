import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@generic-crm/shared-infrastructure';
import { VerifactuApplicationService } from '@generic-crm/verifactu-backend';

@Injectable()
export class InvoicingApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verifactu: VerifactuApplicationService,
  ) {}

  list(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, taxId: true } },
      },
    });
  }

  async create(
    tenantId: string,
    input: {
      clientId?: string;
      total?: number;
      currency?: string;
    },
  ) {
    if (input.clientId) {
      const client = await this.prisma.client.findFirst({
        where: { id: input.clientId, tenantId },
      });
      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }
    }
    return this.prisma.invoice.create({
      data: {
        tenantId,
        clientId: input.clientId,
        total: input.total ?? 0,
        currency: input.currency ?? 'EUR',
        status: 'DRAFT',
      },
      include: {
        client: { select: { id: true, name: true, taxId: true } },
      },
    });
  }

  async issue(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }
    const number =
      invoice.number ?? `INV-${invoice.id.replace(/-/g, '').slice(0, 10)}`;
    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'ISSUED',
        issuedAt: new Date(),
        number,
      },
      include: {
        client: { select: { id: true, name: true, taxId: true } },
      },
    });
    const auto = process.env['VERIFACTU_AUTO_ENQUEUE'];
    if (auto === '1' || auto === 'true') {
      try {
        await this.verifactu.enqueue(tenantId, invoiceId);
      } catch {
        /* ya en cola u otro error de negocio: no bloquea emisión */
      }
    }
    return updated;
  }
}
