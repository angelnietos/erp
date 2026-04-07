import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import * as crypto from 'crypto';

type InvoiceData = { budgetId?: string; status?: string; type?: string; invoiceNumber?: string; total?: number; [key: string]: unknown };
type DbInvoiceData = { id: string; budgetId: string; status: string; type: string; invoiceNumber: string; total: number; issueDate: Date; dueDate: Date; verifactuStatus: string; currentHash?: string | null; previousHash?: string | null; budget?: unknown };

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId },
      include: {
        budget: {
          include: { client: true, items: { include: { product: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return invoices.map((i) => this.mapToDto(i));
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        budget: {
          include: { client: true, items: { include: { product: true } } },
        },
      },
    });

    if (!invoice) throw new NotFoundException('Factura no encontrada');
    return this.mapToDto(invoice);
  }

  async create(tenantId: string, data: InvoiceData) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: data.budgetId, tenantId },
      include: { client: true, items: true },
    });

    if (!budget) {
      throw new NotFoundException('Presupuesto no asociado o inexistente');
    }

    // Calcula total basado en el presupuesto
    const calculatedTotal = budget.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const invoiceNum = data.invoiceNumber || `F/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000) + 1000}`;

    // Obtener la última factura para encadenar el hash (Verifactu)
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    const previousHash = lastInvoice?.currentHash || null;
    
    // Hash provisorio
    const hashPayload = `${tenantId}-${invoiceNum}-${calculatedTotal}-${new Date().toISOString()}-${previousHash}`;
    const currentHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        budgetId: budget.id,
        invoiceNumber: invoiceNum,
        status: data.status || 'DRAFT',
        type: data.type || 'NORMAL',
        total: calculatedTotal,
        previousHash,
        currentHash,
      },
      include: {
        budget: { include: { client: true, items: { include: { product: true } } } },
      },
    });

    return this.mapToDto(invoice);
  }

  async update(tenantId: string, id: string, data: InvoiceData) {
    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = String(data.status).toUpperCase();
    if (data.type) updateData.type = String(data.type).toUpperCase();
    if (data.verifactuStatus) {
      updateData.verifactuStatus = String(data.verifactuStatus).toUpperCase();
    }

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        budget: { include: { client: true, items: { include: { product: true } } } },
      },
    });

    return this.mapToDto(invoice);
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.invoice.delete({ where: { id } });
    return { success: true };
  }

  private mapToDto(invoice: unknown) {
    const inv = invoice as DbInvoiceData;
    const b = inv.budget as { client?: { name: string }, items?: { id: string, product: { name: string }, quantity: number, price: number }[] };
    
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      budgetId: inv.budgetId,
      clientName: b?.client?.name || 'Cliente Genérico',
      status: inv.status.toLowerCase(),
      type: inv.type.toLowerCase(),
      total: inv.total,
      issueDate: inv.issueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      dueDate: inv.dueDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      verifactuStatus: inv.verifactuStatus.toLowerCase(),
      items: b?.items?.map((item) => ({
        id: item.id,
        description: item.product?.name || 'Producto/Servicio',
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.quantity * item.price,
      })) || [],
      hashDetails: {
        currentHash: inv.currentHash,
        previousHash: inv.previousHash
      }
    };
  }
}
