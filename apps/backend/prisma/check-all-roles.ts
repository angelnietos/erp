import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(__dirname, '../.env') });
loadEnv();

const connectionString = process.env.DATABASE_URL;
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString! }) });

async function main() {
  const roles = await (p as any).role.findMany({
    select: { name: true, permissions: true, tenantId: true }
  });
  console.log(JSON.stringify(roles, null, 2));
}

main().finally(() => p.$disconnect());
