import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaClient } from '../../../node_modules/.prisma/crm-client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { resolveCrmDatabaseUrl } from '../../../libs/crm/node/shared-infrastructure/src/lib/prisma/crm-database-url';
import {
  ERP_TENANT_IDS,
  SEED_CLIENT_IDS,
  SEED_INVOICE_IDS,
} from '../../../scripts/billing-demo-seed-ids';

export async function seedCrmDatabase(): Promise<void> {
  const connectionString = resolveCrmDatabaseUrl();

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(CRM_DEMO_PASSWORD, 10);

  const demo = await ensureErpAlignedTenant(prisma, {
    id: ERP_TENANT_IDS.demo,
    name: 'Organización demo',
    slug: 'demo',
    enabledModuleIds: ['identity', 'clients', 'verifactu'],
  });

  const adminRoleDemo = await ensureRole(prisma, demo.id, {
    name: 'ADMIN',
    description: 'Administrador del tenant',
    permissions: ['*'],
  });

  const viewerRoleDemo = await ensureRole(prisma, demo.id, {
    name: 'VIEWER',
    description: 'Solo lectura (clientes)',
    permissions: ['clients:read'],
  });

  await ensureUserWithRole(prisma, demo.id, passwordHash, adminRoleDemo.id, {
    email: 'admin@demo.local',
    firstName: 'Admin',
    lastName: 'Demo',
  });

  await ensureUserWithRole(prisma, demo.id, passwordHash, viewerRoleDemo.id, {
    email: 'visor@demo.local',
    firstName: 'Visor',
    lastName: 'Demo',
  });

  const acme = await ensureTenant(prisma, {
    name: 'Acme Corp (prueba)',
    slug: 'acme',
    enabledModuleIds: ['identity', 'clients', 'verifactu'],
  });

  const adminRoleAcme = await ensureRole(prisma, acme.id, {
    name: 'ADMIN',
    description: 'Administrador del tenant',
    permissions: ['*'],
  });

  await ensureUserWithRole(prisma, acme.id, passwordHash, adminRoleAcme.id, {
    email: 'admin@acme.local',
    firstName: 'Admin',
    lastName: 'Acme',
  });

  const josanz = await ensureErpAlignedTenant(prisma, {
    id: ERP_TENANT_IDS.josanz,
    name: 'Generic ERP',
    slug: 'josanz',
    enabledModuleIds: ['identity', 'clients', 'verifactu'],
  });

  const adminRoleJosanz = await ensureRole(prisma, josanz.id, {
    name: 'ADMIN',
    description: 'Administrador del tenant',
    permissions: ['*'],
  });

  await ensureUserWithRole(prisma, josanz.id, passwordHash, adminRoleJosanz.id, {
    email: 'admin@josanz.com',
    firstName: 'Admin',
    lastName: 'Josanz',
  });

  const alexis = await ensureErpAlignedTenant(prisma, {
    id: ERP_TENANT_IDS.alexis,
    name: 'Alexis',
    slug: 'alexis',
    enabledModuleIds: ['identity', 'clients', 'verifactu'],
  });

  const adminRoleAlexis = await ensureRole(prisma, alexis.id, {
    name: 'ADMIN',
    description: 'Administrador del tenant',
    permissions: ['*'],
  });

  await ensureUserWithRole(prisma, alexis.id, passwordHash, adminRoleAlexis.id, {
    email: 'admin@alexis.local',
    firstName: 'Admin',
    lastName: 'Alexis',
  });

  const babooni = await ensureErpAlignedTenant(prisma, {
    id: ERP_TENANT_IDS.babooni,
    name: 'Babooni Technologies',
    slug: 'babooni',
    enabledModuleIds: ['identity', 'clients', 'verifactu'],
  });

  const adminRoleBabooni = await ensureRole(prisma, babooni.id, {
    name: 'ADMIN',
    description: 'Administrador del tenant',
    permissions: ['*'],
  });

  await ensureUserWithRole(prisma, babooni.id, passwordHash, adminRoleBabooni.id, {
    email: 'alejandro.ballesteros@babooni.com',
    firstName: 'Alejandro',
    lastName: 'Ballesteros',
  });

  await ensureUserWithRole(prisma, babooni.id, passwordHash, adminRoleBabooni.id, {
    email: 'root@babooni.com',
    firstName: 'Babooni',
    lastName: 'Root',
  });

  await ensureUserWithRole(prisma, babooni.id, passwordHash, adminRoleBabooni.id, {
    email: 'alvaro.ballesteros@babooni.com',
    firstName: 'Alvaro',
    lastName: 'Ballesteros',
  });

  const clientDemo = await ensureClientDemo(prisma, demo.id);
  await ensureDraftInvoice(prisma, demo.id, clientDemo.id);

  await seedErpMirroredBillingDemo(prisma);

  console.log('');
  console.log(
    'Seed OK — usuarios de prueba (contraseña para todos):',
    CRM_DEMO_PASSWORD,
  );
  console.log('');
  console.log('| Tenant (slug) | Email                | Rol    |');
  console.log('|----------------|----------------------|--------|');
  console.log('| demo           | admin@demo.local     | ADMIN  |');
  console.log('| demo           | visor@demo.local     | VIEWER |');
  console.log('| acme           | admin@acme.local     | ADMIN  |');
  console.log('| josanz         | admin@josanz.com     | ADMIN  |');
  console.log('| alexis         | admin@alexis.local   | ADMIN  |');
  console.log('| babooni        | alejandro.ballesteros@babooni.com | ADMIN  |');
  console.log('| babooni        | root@babooni.com     | ADMIN  |');
  console.log('| babooni        | alvaro.ballesteros@babooni.com | ADMIN  |');
  console.log('');
  console.log(
    'Login: en el formulario usar "Tenant (slug)" = demo, acme, josanz, alexis o babooni (o cabecera x-tenant-id con UUID).',
  );
  console.log('');
  console.log(
    'Facturas espejo ERP: josanz (F/2026/0001-0002), babooni (BB/2026/0001-0002) — mismos UUID que apps/backend/prisma/seed.ts',
  );

  await prisma.$disconnect();
  await pool.end();
}

async function removeMisalignedTenant(prisma: PrismaClient, tenantId: string) {
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true },
  });
  for (const user of users) {
    await prisma.userRole.deleteMany({ where: { userId: user.id } });
  }
  await prisma.user.deleteMany({ where: { tenantId } });
  await prisma.role.deleteMany({ where: { tenantId } });
  await prisma.verifactuQueueItem.deleteMany({ where: { tenantId } });
  await prisma.verifactuLog.deleteMany({ where: { tenantId } });
  await prisma.invoice.deleteMany({ where: { tenantId } });
  await prisma.client.deleteMany({ where: { tenantId } });
  await prisma.verifactuSeries.deleteMany({ where: { tenantId } });
  await prisma.verifactuCustomer.deleteMany({ where: { tenantId } });
  await prisma.verifactuTenantCredential.deleteMany({ where: { tenantId } });
  await prisma.verifactuAeatChainHead.deleteMany({ where: { tenantId } });
  await prisma.tenant.delete({ where: { id: tenantId } });
}

async function ensureErpAlignedTenant(
  prisma: PrismaClient,
  data: {
    id: string;
    name: string;
    slug: string;
    enabledModuleIds: string[];
  },
) {
  const bySlug = await prisma.tenant.findUnique({ where: { slug: data.slug } });
  if (bySlug && bySlug.id !== data.id) {
    await removeMisalignedTenant(prisma, bySlug.id);
  }
  return prisma.tenant.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      name: data.name,
      slug: data.slug,
      enabledModuleIds: data.enabledModuleIds,
      isActive: true,
    },
    update: {
      name: data.name,
      slug: data.slug,
      enabledModuleIds: data.enabledModuleIds,
      isActive: true,
    },
  });
}

async function ensureTenant(
  prisma: PrismaClient,
  data: {
    name: string;
    slug: string;
    enabledModuleIds: string[];
  },
) {
  const existing = await prisma.tenant.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    return prisma.tenant.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        enabledModuleIds: data.enabledModuleIds,
        isActive: true,
      },
    });
  }
  return prisma.tenant.create({ data });
}

async function ensureRole(
  prisma: PrismaClient,
  tenantId: string,
  def: { name: string; description: string; permissions: string[] },
) {
  const existing = await prisma.role.findFirst({
    where: { tenantId, name: def.name },
  });
  if (existing) {
    return prisma.role.update({
      where: { id: existing.id },
      data: {
        description: def.description,
        permissions: def.permissions,
      },
    });
  }
  return prisma.role.create({
    data: {
      tenantId,
      name: def.name,
      description: def.description,
      permissions: def.permissions,
    },
  });
}

async function ensureUserWithRole(
  prisma: PrismaClient,
  tenantId: string,
  passwordHash: string,
  roleId: string,
  u: { email: string; firstName: string; lastName: string },
) {
  let user = await prisma.user.findFirst({
    where: { tenantId, email: u.email },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        tenantId,
        email: u.email,
        password: passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: true,
      },
    });
  }

  const ur = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId },
  });
  if (!ur) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId },
    });
  }
}

async function ensureClientDemo(prisma: PrismaClient, tenantId: string) {
  const existing = await prisma.client.findFirst({
    where: { tenantId, taxId: 'B00000000' },
  });
  if (existing) {
    return existing;
  }
  return prisma.client.create({
    data: {
      tenantId,
      name: 'Cliente de ejemplo S.L.',
      type: 'COMPANY',
      taxId: 'B00000000',
      country: 'ES',
    },
  });
}

async function ensureDraftInvoice(
  prisma: PrismaClient,
  tenantId: string,
  clientId: string,
) {
  const existing = await prisma.invoice.findFirst({
    where: { tenantId, status: 'DRAFT', number: null },
  });
  if (existing) {
    return;
  }
  await prisma.invoice.create({
    data: {
      tenantId,
      clientId,
      total: 121.0,
      currency: 'EUR',
      status: 'DRAFT',
    },
  });
}

/** Contraseña compartida para todos los usuarios de prueba (solo desarrollo). */
export const CRM_DEMO_PASSWORD = 'Demo12345!';

/**
 * Réplica en CRM de facturas demo del ERP (mismos UUID) para probar Verifactu e integración.
 */
async function seedErpMirroredBillingDemo(prisma: PrismaClient) {
  const josanzClient = await upsertClient(prisma, {
    id: SEED_CLIENT_IDS.josanz.eventosGlobal,
    tenantId: ERP_TENANT_IDS.josanz,
    name: 'Eventos Global S.L.',
    taxId: 'B12345678',
    email: 'info@eventosglobal.es',
  });

  const babooniClient = await upsertClient(prisma, {
    id: SEED_CLIENT_IDS.babooni.biosstel,
    tenantId: ERP_TENANT_IDS.babooni,
    name: 'Biosstel Eventos S.L.',
    taxId: 'B11111111',
    email: 'hola@biosstel.demo',
  });

  const josanzHash1 = createHash('sha256').update('hash1').digest('hex');
  const josanzHash2 = createHash('sha256').update('hash2').digest('hex');
  const babooniHash1 = createHash('sha256').update('babooni-hash1').digest('hex');
  const babooniHash2 = createHash('sha256').update('babooni-hash2').digest('hex');

  const josanzTotal1 = 2300 * 1.21;
  const josanzTotal2 = 1200 * 1.21;
  const babooniTotal1 = 1620 * 1.21;
  const babooniTotal2 = 6400 * 1.21;

  await upsertMirroredInvoice(prisma, {
    id: SEED_INVOICE_IDS.josanz.paid,
    tenantId: ERP_TENANT_IDS.josanz,
    clientId: josanzClient.id,
    number: 'F/2026/0001',
    total: josanzTotal1,
    status: 'ISSUED',
    issuedAt: new Date('2026-04-15'),
    verifactuStatus: 'SENT',
    currentHash: josanzHash1,
  });

  await upsertMirroredInvoice(prisma, {
    id: SEED_INVOICE_IDS.josanz.pending,
    tenantId: ERP_TENANT_IDS.josanz,
    clientId: josanzClient.id,
    number: 'F/2026/0002',
    total: josanzTotal2,
    status: 'ISSUED',
    issuedAt: new Date('2026-04-22'),
    verifactuStatus: 'PENDING',
    currentHash: josanzHash2,
    previousHash: josanzHash1,
  });

  await upsertMirroredInvoice(prisma, {
    id: SEED_INVOICE_IDS.babooni.paid,
    tenantId: ERP_TENANT_IDS.babooni,
    clientId: babooniClient.id,
    number: 'BB/2026/0001',
    total: babooniTotal1,
    status: 'ISSUED',
    issuedAt: new Date('2026-05-05'),
    verifactuStatus: 'SENT',
    currentHash: babooniHash1,
  });

  await upsertMirroredInvoice(prisma, {
    id: SEED_INVOICE_IDS.babooni.pending,
    tenantId: ERP_TENANT_IDS.babooni,
    clientId: babooniClient.id,
    number: 'BB/2026/0002',
    total: babooniTotal2,
    status: 'ISSUED',
    issuedAt: new Date('2026-06-12'),
    verifactuStatus: 'PENDING',
    currentHash: babooniHash2,
    previousHash: babooniHash1,
  });

  await ensureVerifactuSeries(prisma, ERP_TENANT_IDS.josanz, 'A', 'Serie principal');
  await ensureVerifactuSeries(prisma, ERP_TENANT_IDS.babooni, 'BB', 'Serie fiscal Babooni');

  await ensureVerifactuQueueItem(
    prisma,
    ERP_TENANT_IDS.josanz,
    SEED_INVOICE_IDS.josanz.pending,
  );
  await ensureVerifactuQueueItem(
    prisma,
    ERP_TENANT_IDS.babooni,
    SEED_INVOICE_IDS.babooni.pending,
  );

  await ensureVerifactuLogSuccess(
    prisma,
    ERP_TENANT_IDS.josanz,
    SEED_INVOICE_IDS.josanz.paid,
    'F/2026/0001',
  );
  await ensureVerifactuLogSuccess(
    prisma,
    ERP_TENANT_IDS.babooni,
    SEED_INVOICE_IDS.babooni.paid,
    'BB/2026/0001',
  );

  console.log('- CRM: facturas espejo josanz + babooni (Verifactu cola/log/series)');
}

async function upsertClient(
  prisma: PrismaClient,
  data: {
    id: string;
    tenantId: string;
    name: string;
    taxId: string;
    email: string;
  },
) {
  return prisma.client.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      tenantId: data.tenantId,
      name: data.name,
      type: 'COMPANY',
      taxId: data.taxId,
      email: data.email,
      country: 'ES',
    },
    update: {
      name: data.name,
      taxId: data.taxId,
      email: data.email,
    },
  });
}

async function upsertMirroredInvoice(
  prisma: PrismaClient,
  data: {
    id: string;
    tenantId: string;
    clientId: string;
    number: string;
    total: number;
    status: string;
    issuedAt: Date;
    verifactuStatus: string;
    currentHash: string;
    previousHash?: string;
  },
) {
  return prisma.invoice.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      tenantId: data.tenantId,
      clientId: data.clientId,
      number: data.number,
      total: data.total,
      currency: 'EUR',
      status: data.status,
      issuedAt: data.issuedAt,
      verifactuStatus: data.verifactuStatus,
      currentHash: data.currentHash,
      previousHash: data.previousHash,
      invoiceKind: 'NORMAL',
    },
    update: {
      clientId: data.clientId,
      number: data.number,
      total: data.total,
      status: data.status,
      issuedAt: data.issuedAt,
      verifactuStatus: data.verifactuStatus,
      currentHash: data.currentHash,
      previousHash: data.previousHash,
    },
  });
}

async function ensureVerifactuSeries(
  prisma: PrismaClient,
  tenantId: string,
  code: string,
  description: string,
) {
  const existing = await prisma.verifactuSeries.findFirst({
    where: { tenantId, code },
  });
  if (existing) {
    return existing;
  }
  return prisma.verifactuSeries.create({
    data: { tenantId, code, description },
  });
}

async function ensureVerifactuQueueItem(
  prisma: PrismaClient,
  tenantId: string,
  invoiceId: string,
) {
  const existing = await prisma.verifactuQueueItem.findFirst({
    where: { tenantId, invoiceId },
  });
  if (existing) {
    return existing;
  }
  return prisma.verifactuQueueItem.create({
    data: {
      tenantId,
      invoiceId,
      status: 'PENDING',
      retries: 0,
    },
  });
}

async function ensureVerifactuLogSuccess(
  prisma: PrismaClient,
  tenantId: string,
  invoiceId: string,
  invoiceNumber: string,
) {
  const existing = await prisma.verifactuLog.findFirst({
    where: { tenantId, invoiceId, status: 'SUCCESS' },
  });
  if (existing) {
    return existing;
  }
  return prisma.verifactuLog.create({
    data: {
      tenantId,
      invoiceId,
      status: 'SUCCESS',
      requestPayload: { invoiceId, invoiceNumber, demo: true },
      responsePayload: { ok: true, status: 'ACCEPTED' },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

async function main(): Promise<void> {
  await seedCrmDatabase();
}
