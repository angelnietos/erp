// Shared types for Fleet domain
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: 'van' | 'truck' | 'car';
  status: 'available' | 'in_use' | 'maintenance';
  currentDriver?: string;
  insuranceExpiry: string;
  itvExpiry: string;
  capacity?: number;
  mileage?: number;
  createdAt: string;
}

export interface Driver {
  id: string;
  employeeId: string;
  name: string;
  licenseExpiry: string;
  phone?: string;
  status: 'active' | 'inactive';
}

// Stub
export function fleetApi(): string {
  return 'fleet-api';
}
