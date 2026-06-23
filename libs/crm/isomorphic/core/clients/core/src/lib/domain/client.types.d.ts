/** Registro de cliente + contactos (forma agnóstica de persistencia). */
export interface ClientContactRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  notes: string | null;
  isPrimary: boolean;
}
export interface ClientRecord {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  sector: string | null;
  type: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  country: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  contacts: ClientContactRecord[];
}
export interface CreateClientInput {
  name: string;
  description?: string;
  sector?: string;
  type?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}
export type UpdateClientInput = Partial<CreateClientInput>;
