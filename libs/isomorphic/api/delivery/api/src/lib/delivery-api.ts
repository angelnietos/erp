// Shared types for Delivery domain
export interface DeliveryNote {
  id: string;
  budgetId: string;
  budgetReference?: string;
  clientName: string;
  recipientName?: string;
  deliveryAddress?: string;
  status: 'draft' | 'pending' | 'signed' | 'completed';
  deliveryDate: string;
  returnDate: string;
  itemsCount: number;
  signature?: string;
  items?: DeliveryItem[];
  notes?: string;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  condition: 'new' | 'good' | 'damaged' | 'missing';
  observations?: string;
}

// Stub
export function deliveryApi(): string {
  return 'delivery-api';
}
