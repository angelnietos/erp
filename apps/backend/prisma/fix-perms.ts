import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(__dirname, '../.env') });
loadEnv();

const connectionString = process.env.DATABASE_URL;
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: connectionString! }) });

async function main() {
  const result = await (p as any).role.updateMany({
    where: { name: 'Administrador' },
    data: { permissions: ['*'] }
  });
  console.log(`Updated ${result.count} roles.`);
}

main().finally(() => p.$disconnect());
