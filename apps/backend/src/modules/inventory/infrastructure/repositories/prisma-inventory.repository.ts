import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-data-access';
import { InventoryRepositoryPort, Inventory, InventoryReservation } from '@josanz-erp/inventory-core';
import { EntityId } from '@josanz-erp/shared-model';

@Injectable()
export class PrismaInventoryRepository implements InventoryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: EntityId): Promise<Inventory | null> {
    const data = await (this.prisma as any).inventory.findUnique({
      where: { productId: productId.value },
    });
    return data ? Inventory.reconstitute(data.id, {
      productId: new EntityId(data.productId),
      totalStock: data.totalStock,
      status: data.status as any,
      version: data.version,
    }) : null;
  }

  async save(inventory: Inventory): Promise<void> {
    const { id, productId, totalStock, status, version } = inventory as any;
    
    await (this.prisma as any).inventory.upsert({
      where: { id: id.value },
      update: { totalStock, status, version: { increment: 1 } },
      create: {
        id: id.value,
        productId: productId.value,
        totalStock,
        status,
        version,
      },
    });
  }

  async getOverlapReservations(productId: EntityId, start: Date, end: Date): Promise<InventoryReservation[]> {
    const data = await (this.prisma as any).inventoryReservation.findMany({
      where: {
        productId: productId.value,
        status: 'ACTIVE',
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    return data.map((d: any) => new InventoryReservation(new EntityId(d.id), {
      productId: new EntityId(d.productId),
      quantity: d.quantity,
      startDate: d.startDate,
      endDate: d.endDate,
      referenceType: d.referenceType as any,
      referenceId: d.referenceId ? new EntityId(d.referenceId) : undefined,
      status: d.status as any,
    }));
  }

  async saveReservation(reservation: InventoryReservation): Promise<void> {
    const { id, productId, quantity, startDate, endDate, referenceType, referenceId, status } = reservation as any;
    
    await (this.prisma as any).inventoryReservation.upsert({
      where: { id: id.value },
      update: { status },
      create: {
        id: id.value,
        productId: productId.value,
        quantity,
        startDate,
        endDate,
        referenceType,
        referenceId: referenceId?.value,
        status,
      },
    });
  }
}
