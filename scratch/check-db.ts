import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: 'apps/backend/.env' });
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log('\n--- Users ---');
  const users = await prisma.user.findMany({
    include: {
      tenant: true,
      roles: {
        include: {
          role: true,
        }
      }
    }
  });

  for (const u of users) {
    const isPasswordMatch = await bcrypt.compare('Admin123!', u.password);
    console.log(`User: ${u.email}`);
    console.log(`  Tenant: ${u.tenant?.slug} (${u.tenantId})`);
    console.log(`  Password Match (Admin123!): ${isPasswordMatch}`);
    console.log(`  Is Active: ${u.isActive}`);
    console.log(`  Roles: ${u.roles.map(r => r.role.name).join(', ')}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
