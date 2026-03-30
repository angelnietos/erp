import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';

type ProductData = { name: string; sku?: string; category?: string; type?: string; totalStock?: number; availableStock?: number; reservedStock?: number; status?: string; dailyRate?: number; [key: string]: unknown };

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { inventory: true },
      orderBy: { name: 'asc' },
    });
    return products.map(p => this.mapToDto(p));
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { inventory: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.mapToDto(product);
  }

  async create(tenantId: string, data: ProductData) {
    const product = await this.prisma.product.create({
      data: {
        tenantId,
        name: data.name,
        sku: data.sku,
        category: data.category,
        type: data.type || 'generic',
        price: data.dailyRate || 0,
        dailyRate: data.dailyRate || 0,
        inventory: {
          create: {
            totalStock: data.totalStock || 0,
            status: data.status || 'available',
          }
        }
      },
      include: { inventory: true }
    });
    return this.mapToDto(product);
  }

  async update(tenantId: string, id: string, data: ProductData) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        type: data.type,
        price: data.dailyRate,
        dailyRate: data.dailyRate,
        inventory: {
          update: {
            totalStock: data.totalStock,
            status: data.status,
          }
        }
      },
      include: { inventory: true }
    });
    return this.mapToDto(product);
  }

  async delete(tenantId: string, id: string) {
    // Inventory and other relations need to be deleted via cascade or manual in real world
    // We will do a manual delete of inventory first then product to not break FKs
    await this.prisma.$transaction(async (tx) => {
      await tx.inventory.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });
    return { success: true };
  }

  private mapToDto(product: any) {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku || `SKU-${product.id.split('-')[0]}`,
      category: product.category || 'Varios',
      type: product.type || 'generic',
      totalStock: product.inventory?.totalStock || 0,
      availableStock: product.inventory?.totalStock || 0, // Should calculate from reservations in real life
      reservedStock: 0,
      status: product.inventory?.status || 'available',
      dailyRate: product.dailyRate || product.price || 0,
      imageUrl: product.imageUrl,
      description: product.description,
      serialNumber: product.serialNumber
    };
  }
}
