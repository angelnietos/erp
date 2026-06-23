import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@generic-crm/prisma-client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/** Contraseña compartida para todos los usuarios de prueba (solo desarrollo). */
const DEMO_PASSWORD = 'Demo12345!';

async function main() {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for seed');
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const demo = await ensureTenant(prisma, {
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

  const josanz = await ensureTenant(prisma, {
    name: 'Josanz ERP',
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

  const alexis = await ensureTenant(prisma, {
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

  const babooni = await ensureTenant(prisma, {
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

  const clientDemo = await ensureClientDemo(prisma, demo.id);
  await ensureDraftInvoice(prisma, demo.id, clientDemo.id);

  console.log('');
  console.log(
    'Seed OK — usuarios de prueba (contraseña para todos):',
    DEMO_PASSWORD,
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
  console.log('');
  console.log(
    'Login: en el formulario usar "Tenant (slug)" = demo, acme, josanz, alexis o babooni (o cabecera x-tenant-id con UUID).',
  );

  await prisma.$disconnect();
  await pool.end();
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
    where: { tenantId, status: 'DRAFT' },
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
