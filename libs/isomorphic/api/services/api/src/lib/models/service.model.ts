export type ServiceType =
  | 'STREAMING'
  | 'PRODUCCIÓN'
  | 'LED'
  | 'TRANSPORTE'
  | 'PERSONAL_TÉCNICO'
  | 'VIDEO_TÉCNICO';

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: ServiceType;
  basePrice: number;
  hourlyRate?: number;
  configuration?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateServiceDTO {
  tenantId: string;
  name: string;
  description?: string;
  type: ServiceType;
  basePrice: number;
  hourlyRate?: number;
  configuration?: Record<string, any>;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  type?: ServiceType;
  basePrice?: number;
  hourlyRate?: number;
  configuration?: Record<string, any>;
  isActive?: boolean;
}
