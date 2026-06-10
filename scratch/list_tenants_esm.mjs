import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(process.cwd(), 'apps/backend/.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in apps/backend/.env');
  process.exit(1);
}

const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString }) });

async function main() {
  const tenants = await p.tenant.findMany();
  console.log('TENANTS:', JSON.stringify(tenants, null, 2));
}

main().finally(() => p.$disconnect());
