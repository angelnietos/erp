import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  AuditLogWriterService,
  PrismaService,
} from '@josanz-erp/shared-infrastructure';

type ProductData = Record<string, unknown>;

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogWriter: AuditLogWriterService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get db(): any { return this.prisma; }

  async findAll(tenantId: string) {
    const products = await this.db.product.findMany({
      where: { tenantId },
      include: { inventory: true },
      orderBy: { name: 'asc' },
    });
    return products.map((p: Record<string, unknown>) => this.mapToDto(p));
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.db.product.findFirst({
      where: { id, tenantId },
      include: { inventory: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.mapToDto(product);
  }

  async create(tenantId: string, data: ProductData, actorUserId?: string) {
    const product = await this.db.product.create({
      data: {
        tenantId,
        name: String(data['name'] || 'Producto sin nombre'),
        sku: data['sku'] ? String(data['sku']) : undefined,
        category: data['category'] ? String(data['category']) : undefined,
        type: String(data['type'] || 'generic'),
        price: Number(data['dailyRate'] || 0),
        dailyRate: Number(data['dailyRate'] || 0),
        inventory: {
          create: {
            totalStock: Number(data['totalStock'] || 0),
            status: String(data['status'] || 'available'),
          }
        }
      },
      include: { inventory: true }
    });
    return this.mapToDto(product);
  }

  async update(tenantId: string, id: string, data: ProductData, actorUserId?: string) {
    const updatePayload: Record<string, unknown> = {};
    if (data['name']) updatePayload['name'] = String(data['name']);
    if (data['sku']) updatePayload['sku'] = String(data['sku']);
    if (data['category']) updatePayload['category'] = String(data['category']);
    if (data['type']) updatePayload['type'] = String(data['type']);
    if (data['dailyRate'] !== undefined) {
      updatePayload['price'] = Number(data['dailyRate']);
      updatePayload['dailyRate'] = Number(data['dailyRate']);
    }

    const product = await this.db.product.update({
      where: { id },
      data: {
        ...updatePayload,
        ...(data['totalStock'] !== undefined || data['status'] ? {
          inventory: {
            update: {
              ...(data['totalStock'] !== undefined ? { totalStock: Number(data['totalStock']) } : {}),
              ...(data['status'] ? { status: String(data['status']) } : {}),
            }
          }
        } : {})
      },
      include: { inventory: true }
    });
    return this.mapToDto(product);
  }

  async delete(_tenantId: string, id: string, actorUserId?: string) {
    const existing = await this.db.product.findUnique({ where: { id } });
    
    await this.db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.inventory.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    if (existing && actorUserId) {
      void this.auditLogWriter.record(actorUserId, {
        action: 'DELETE',
        targetEntity: `Product:${id}`,
        changesJson: {
          entityType: 'PRODUCT',
          entityName: existing.name,
          details: 'Producto eliminado del inventario',
        },
      }).catch(() => undefined);
    }

    return { success: true };
  }

  private mapToDto(product: Record<string, unknown>) {
    const inv = product['inventory'] as Record<string, unknown> | null;
    return {
      id: product['id'],
      name: product['name'],
      sku: product['sku'] || `SKU-${String(product['id']).split('-')[0]}`,
      category: product['category'] || 'Varios',
      type: product['type'] || 'generic',
      totalStock: inv?.['totalStock'] || 0,
      availableStock: inv?.['totalStock'] || 0,
      reservedStock: 0,
      status: inv?.['status'] || 'available',
      dailyRate: product['dailyRate'] || product['price'] || 0,
      imageUrl: product['imageUrl'],
      description: product['description'],
      serialNumber: product['serialNumber']
    };
  }
}
