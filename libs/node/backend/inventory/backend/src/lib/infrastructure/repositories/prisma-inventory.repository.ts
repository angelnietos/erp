import { Injectable } from '@nestjs/common';
import { PrismaService } from '@josanz-erp/shared-infrastructure';
import {
  InventoryRepositoryPort,
  Inventory,
  InventoryReservation,
  InventoryStatus,
  ReservationProps,
  ReservationStatus,
} from '@josanz-erp/inventory-core';
import { EntityId } from '@josanz-erp/shared-model';

type InventoryPersistenceView = {
  id: EntityId;
  productId: EntityId;
  totalStock: number;
  status: InventoryStatus;
  version: number;
};

type ReservationPersistenceView = {
  id: EntityId;
  productId: EntityId;
  quantity: number;
  startDate: Date;
  endDate: Date;
  referenceType: ReservationProps['referenceType'];
  referenceId?: EntityId;
  status: ReservationStatus;
};

@Injectable()
export class PrismaInventoryRepository implements InventoryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: EntityId): Promise<Inventory | null> {
    const data = await this.prisma.inventory.findUnique({
      where: { productId: productId.value },
    });
    return data ? Inventory.reconstitute(data.id, {
      productId: new EntityId(data.productId),
      totalStock: data.totalStock,
      status: data.status as InventoryStatus,
      version: data.version,
    }) : null;
  }

  async save(inventory: Inventory): Promise<void> {
    const persistenceInventory = inventory as unknown as InventoryPersistenceView;
    
    await this.prisma.inventory.upsert({
      where: { id: persistenceInventory.id.value },
      update: { totalStock: persistenceInventory.totalStock, status: persistenceInventory.status, version: { increment: 1 } },
      create: {
        id: persistenceInventory.id.value,
        productId: persistenceInventory.productId.value,
        totalStock: persistenceInventory.totalStock,
        status: persistenceInventory.status,
        version: persistenceInventory.version,
      },
    });
  }

  async getOverlapReservations(productId: EntityId, start: Date, end: Date): Promise<InventoryReservation[]> {
    const data = await this.prisma.inventoryReservation.findMany({
      where: {
        productId: productId.value,
        status: 'ACTIVE',
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    return data.map((d) => new InventoryReservation(new EntityId(d.id), {
      productId: new EntityId(d.productId),
      quantity: d.quantity,
      startDate: d.startDate,
      endDate: d.endDate,
      referenceType: d.referenceType as ReservationProps['referenceType'],
      referenceId: d.referenceId ? new EntityId(d.referenceId) : undefined,
      status: d.status as ReservationStatus,
    }));
  }

  async saveReservation(reservation: InventoryReservation): Promise<void> {
    const persistenceReservation = reservation as unknown as ReservationPersistenceView;
    
    await this.prisma.inventoryReservation.upsert({
      where: { id: persistenceReservation.id.value },
      update: { status: persistenceReservation.status },
      create: {
        id: persistenceReservation.id.value,
        productId: persistenceReservation.productId.value,
        quantity: persistenceReservation.quantity,
        startDate: persistenceReservation.startDate,
        endDate: persistenceReservation.endDate,
        referenceType: persistenceReservation.referenceType,
        referenceId: persistenceReservation.referenceId?.value,
        status: persistenceReservation.status,
      },
    });
  }
}
