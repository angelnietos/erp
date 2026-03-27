import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
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

  // 2. Users
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@josanz.com' },
    update: { password: hashedPassword },
    create: {
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

  // 3. Clients
  const clients = [
    { name: 'Eventos Global S.L.', sector: 'Entertainment', description: 'VIP Client' },
    { name: 'Audiovisuales Madrid', sector: 'Production', description: 'Frequent partner' },
    { name: 'Congresos S.A.', sector: 'Corporate', description: 'Annual events' },
  ];

  for (const client of clients) {
    await prisma.client.create({
      data: client,
    });
  }

  // 4. Products & Inventory
  const products = [
    { name: 'Proyector Láser 4K', price: 1500, stock: 10 },
    { name: 'Pantalla LED 100"', price: 800, stock: 5 },
    { name: 'Set de Sonido Premium', price: 600, stock: 15 },
    { name: 'Lote de Cableado HDMI', price: 50, stock: 50 },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
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
