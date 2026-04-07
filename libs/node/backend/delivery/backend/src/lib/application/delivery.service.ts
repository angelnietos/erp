import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type DeliveryData = { budgetId?: string; status?: string; signature?: string; [key: string]: unknown };
type DbNoteData = { id: string; budgetId: string; status: string; signatureBlobUrl?: string | null; createdAt: Date; budget?: unknown };

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const notes = await this.prisma.deliveryNote.findMany({
      where: { tenantId },
      include: {
        budget: {
          include: { client: true, items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((n) => this.mapToDto(n));
  }

  async findOne(tenantId: string, id: string) {
    const note = await this.prisma.deliveryNote.findFirst({
      where: { id, tenantId },
      include: {
        budget: {
          include: { client: true, items: { include: { product: true } } },
        },
      },
    });

    if (!note) {
      throw new NotFoundException(`Albarán no encontrado`);
    }

    return this.mapToDto(note);
  }

  async create(tenantId: string, data: DeliveryData) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: data.budgetId, tenantId },
      include: { client: true, items: true }
    });

    if (!budget) {
      throw new NotFoundException(`El presupuesto no pertenece a este tenant o no existe.`);
    }

    const note = await this.prisma.deliveryNote.create({
      data: {
        tenantId,
        budgetId: data.budgetId,
        status: data.status || 'draft',
      },
      include: {
        budget: { include: { client: true, items: true } }
      }
    });

    return this.mapToDto(note);
  }

  async update(tenantId: string, id: string, data: DeliveryData) {
    const updateData: DeliveryData = {};
    if (data.status) updateData.status = data.status;
    if (data.signature) updateData.signatureBlobUrl = data.signature;

    const note = await this.prisma.deliveryNote.update({
      where: { id },
      data: updateData,
      include: {
        budget: { include: { client: true, items: true } }
      }
    });

    return this.mapToDto(note);
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.deliveryNote.delete({
      where: { id }
    });
    return { success: true };
  }

  async sign(tenantId: string, id: string, signature: string) {
    return this.update(tenantId, id, { status: 'signed', signature });
  }

  async complete(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'completed' });
  }

  private mapToDto(note: unknown) {
    const n = note as DbNoteData;
    const b = n.budget as unknown as { startDate?: Date, endDate?: Date, client?: { name: string }, items?: {id: string, product: {name: string}, quantity: number}[] };
    const clientName = b?.client?.name || '—';
    return {
      id: n.id,
      budgetId: n.budgetId,
      budgetReference: `#${String(n.budgetId).slice(0, 8).toUpperCase()}`,
      clientName,
      recipientName: clientName,
      deliveryAddress: '—',
      status: n.status,
      deliveryDate: b?.startDate?.toISOString() || n.createdAt.toISOString(),
      returnDate: b?.endDate?.toISOString() || n.createdAt.toISOString(),
      itemsCount: b?.items?.reduce((acc: number, i: { quantity: number }) => acc + i.quantity, 0) || 0,
      signature: n.signatureBlobUrl,
      items: b?.items?.map((item: { id: string; product: { name: string }; quantity: number }) => ({
        id: item.id,
        name: item.product?.name || 'Item Genérico',
        quantity: item.quantity,
        condition: 'good',
        observations: '',
      })) || [],
    };
  }
}
