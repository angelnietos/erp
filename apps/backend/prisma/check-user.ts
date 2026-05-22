import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.join(__dirname, '../.env') });
loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const p = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const user = await (p as any).user.findFirst({
    where: { email: 'dani@josanz.com' },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });
  console.log(JSON.stringify(user, null, 2));
}

main().finally(() => p.$disconnect());
