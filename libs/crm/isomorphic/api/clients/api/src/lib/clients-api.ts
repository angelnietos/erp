export const clientsPaths = {
  collection: 'clients',
  one: (id: string) => `clients/${id}`,
} as const;

export interface ClientContactRowDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  notes: string | null;
  isPrimary: boolean;
}

/** Cliente en JSON (GET /clients, GET /clients/:id); fechas ISO. */
export interface ClientRowDto {
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
  createdAt: string;
  deletedAt: string | null;
  contacts: ClientContactRowDto[];
}
