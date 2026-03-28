import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  InventoryRepositoryPort,
  INVENTORY_REPOSITORY,
  InventoryReservation,
  ReservationProps,
} from '@josanz-erp/inventory-core';
import { EntityId } from '@josanz-erp/shared-model';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly repository: InventoryRepositoryPort,
  ) {}

  async checkAvailability(productId: string, startDate: Date, endDate: Date, quantity: number): Promise<boolean> {
    const inventory = await this.repository.findByProductId(new EntityId(productId));
    if (!inventory) throw new NotFoundException('Inventory not found for product');

    const totalStock = inventory.totalStock;
    const existingReservations = await this.repository.getOverlapReservations(
      new EntityId(productId),
      startDate,
      endDate
    );

    const reservedQuantity = existingReservations.reduce((acc, curr) => acc + curr.quantity, 0);
    const freeStock = totalStock - reservedQuantity;

    return freeStock >= quantity;
  }

  async reserve(
    productId: string,
    quantity: number,
    start: Date,
    end: Date,
    refType: ReservationProps['referenceType'],
    refId: string,
  ): Promise<string> {
    const isAvailable = await this.checkAvailability(productId, start, end, quantity);
    
    if (!isAvailable) {
      throw new Error(`Insufficient stock for product ${productId} on the specified dates`);
    }

    const reservation = InventoryReservation.create({
      productId: new EntityId(productId),
      quantity,
      startDate: start,
      endDate: end,
      referenceType: refType,
      referenceId: new EntityId(refId),
    });

    await this.repository.saveReservation(reservation);
    return reservation.id.value;
  }
}
