import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
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
  console.log('--- Roles in DB ---');
  const roles = await prisma.role.findMany({
    include: {
      tenant: true
    }
  });
  for (const r of roles) {
    console.log(`Role ID: ${r.id}, Tenant: ${r.tenant?.slug ?? 'null'}, Name: ${r.name}, Type: ${r.type}`);
  }

  console.log('\n--- UserRoles in DB ---');
  const userRoles = await prisma.userRole.findMany({
    include: {
      user: {
        include: {
          tenant: true
        }
      },
      role: true
    }
  });
  for (const ur of userRoles) {
    console.log(`User: ${ur.user.email} (${ur.user.tenant?.slug ?? 'null'}), Role: ${ur.role.name} (tenantId: ${ur.role.tenantId})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
