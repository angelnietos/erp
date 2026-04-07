import { EntityId } from '@josanz-erp/shared-model';

export type ReservationStatus = 'ACTIVE' | 'CANCELLED' | 'CONSUMED';

export interface ReservationProps {
  productId: EntityId;
  quantity: number;
  startDate: Date;
  endDate: Date;
  referenceType: 'BUDGET' | 'RENTAL' | 'DELIVERY';
  referenceId?: EntityId;
  status: ReservationStatus;
}

export class InventoryReservation {
  readonly id: EntityId;
  private props: ReservationProps;

  constructor(id: EntityId, props: ReservationProps) {
    this.id = id;
    this.props = props;
  }

  static create(props: Omit<ReservationProps, 'status'>): InventoryReservation {
    return new InventoryReservation(new EntityId(), {
      ...props,
      status: 'ACTIVE',
    });
  }

  cancel(): void {
    this.props.status = 'CANCELLED';
  }

  get productId(): EntityId { return this.props.productId; }
  get quantity(): number { return this.props.quantity; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date { return this.props.endDate; }
  get status(): ReservationStatus { return this.props.status; }
}

