import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(process.cwd(), 'apps/backend/.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const JOSANZ_TENANT_ID = 'c363035a-2a98-4054-9207-38c8aa5732d9';
  
  // 1. Check if user already exists
  const existing = await prisma.user.findFirst({
    where: { email: 'admin@josanz-erp.local', tenantId: JOSANZ_TENANT_ID }
  });
  console.log('Existing user:', existing);

  // 2. Check what roles exist for the josanz tenant
  const roles = await prisma.role.findMany({
    where: { tenantId: JOSANZ_TENANT_ID },
    select: { id: true, name: true, type: true, permissions: true }
  });
  console.log('Available roles in josanz tenant:', JSON.stringify(roles.map(r => ({ id: r.id, name: r.name, type: r.type, permCount: r.permissions.length })), null, 2));

  // 3. Show existing admin user
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@josanz.com', tenantId: JOSANZ_TENANT_ID },
    include: { roles: { include: { role: { select: { name: true, permissions: true } } } } }
  });
  console.log('admin@josanz.com user:', JSON.stringify({
    id: adminUser?.id,
    email: adminUser?.email,
    roles: adminUser?.roles.map(r => ({ name: r.role.name, permCount: r.role.permissions.length }))
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
