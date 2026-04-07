// Shared types for Inventory domain
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  status: 'available' | 'reserved' | 'maintenance' | 'retired';
  dailyRate: number;
  imageUrl?: string;
  description?: string;
}

export interface InventoryStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
}

// Stub
export function inventoryApi(): string {
  return 'inventory-api';
}
