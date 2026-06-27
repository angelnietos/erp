/**
 * UUID fijos para facturas demo ERP ↔ CRM (Verifactu).
 * Mantener sincronizados en `apps/backend/prisma/seed.ts` y
 * `apps/verifactu-crm-api/prisma/seed.ts`.
 */
export const ERP_TENANT_IDS = {
  demo: 'a0b1c2d3-e4f5-4678-9abc-def012345678',
  josanz: 'c363035a-2a98-4054-9207-38c8aa5732d9',
  alexis: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
  babooni: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
} as const;

export const SEED_INVOICE_IDS = {
  josanz: {
    paid: 'f1a2b3c4-d5e6-4789-a012-345678901001',
    pending: 'f1a2b3c4-d5e6-4789-a012-345678901002',
  },
  babooni: {
    paid: 'b1b2c3d4-e5f6-4789-a012-345678901001',
    pending: 'b1b2c3d4-e5f6-4789-a012-345678901002',
  },
  alexis: {
    issued: 'a1a2a3a4-a5a6-4789-a012-345678901001',
  },
} as const;

export const SEED_CLIENT_IDS = {
  josanz: {
    eventosGlobal: 'c1c2c3d4-e5f6-4789-a012-345678901001',
  },
  babooni: {
    biosstel: 'c2c2c3d4-e5f6-4789-a012-345678901001',
  },
} as const;

/** Bloques del ledger fiscal demo (CRM verifactu_chain_blocks). */
export const SEED_CHAIN_BLOCK_IDS = {
  josanz: {
    paid: 'd1d2d3d4-e5f6-4789-a012-345678901001',
  },
  babooni: {
    paid: 'd2d2d3d4-e5f6-4789-a012-345678901001',
  },
} as const;
