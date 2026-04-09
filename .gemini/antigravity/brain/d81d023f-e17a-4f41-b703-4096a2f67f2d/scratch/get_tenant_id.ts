import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: 'apps/backend/.env' });

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'josanz' } });
  console.log('=> NEW_TENANT_ID:', tenant?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
