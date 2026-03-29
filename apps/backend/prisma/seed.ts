import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: 'apps/backend/.env' });
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: { name: 'STAFF' },
  });

  // 2. Default tenant (required for users, clients, catalog, Verifactu)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'josanz' },
    update: {},
    create: {
      name: 'Josanz Audiovisuales',
      slug: 'josanz',
    },
  });

  // 3. Admin user (login uses tenantSlug "josanz" → this tenant id)
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: 'admin@josanz.com' },
    },
    update: { password: hashedPassword },
    create: {
      tenantId: tenant.id,
      email: 'admin@josanz.com',
      password: hashedPassword,
      firstName: 'Josanz',
      lastName: 'Admin',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  // 4. Tenant API key for Verifactu API
  const rawApiKey = 'vf_dev_josanz_key';
  const keyHash = createHash('sha256').update(rawApiKey).digest('hex');
  const existingTenantKey = await prisma.tenantApiKey.findFirst({
    where: { tenantId: tenant.id },
    select: { id: true },
  });
  if (existingTenantKey) {
    await prisma.tenantApiKey.update({
      where: { id: existingTenantKey.id },
      data: { keyHash, scopes: ['invoice.submit'], isActive: true },
    });
  } else {
    await prisma.tenantApiKey.create({
      data: {
        tenantId: tenant.id,
        keyHash,
        scopes: ['invoice.submit'],
        isActive: true,
      },
    });
  }

  await prisma.verifactuSeries.upsert({
    where: { uq_verifactu_series_tenant_code: { tenantId: tenant.id, code: 'A' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'A',
      description: 'Serie principal',
    },
  });

  await prisma.verifactuCustomer.upsert({
    where: { uq_verifactu_customer_tenant_taxid: { tenantId: tenant.id, taxId: 'B12345678' } },
    update: {},
    create: {
      tenantId: tenant.id,
      taxId: 'B12345678',
      name: 'Cliente Demo Verifactu',
      email: 'cliente-demo@josanz.com',
      countryCode: 'ES',
    },
  });

  // 5. Clients
  const clients = [
    { name: 'Eventos Global S.L.', sector: 'Entertainment', description: 'VIP Client' },
    { name: 'Audiovisuales Madrid', sector: 'Production', description: 'Frequent partner' },
    { name: 'Congresos S.A.', sector: 'Corporate', description: 'Annual events' },
  ];

  for (const client of clients) {
    await prisma.client.create({
      data: { ...client, tenantId: tenant.id },
    });
  }

  // 6. Products & Inventory
  const products = [
    { name: 'Proyector Láser 4K', price: 1500, stock: 10 },
    { name: 'Pantalla LED 100"', price: 800, stock: 5 },
    { name: 'Set de Sonido Premium', price: 600, stock: 15 },
    { name: 'Lote de Cableado HDMI', price: 50, stock: 50 },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: p.name,
        description: `Premium ${p.name} for high-end events`,
        price: p.price,
        inventory: {
          create: {
            totalStock: p.stock,
            status: 'AVAILABLE',
          },
        },
      },
    });
    console.log(`- Created product: ${product.name}`);
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
