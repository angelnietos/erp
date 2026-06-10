const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

async function main() {
  try {
    const tenants = await client.tenant.findMany();
    console.log('Tenants list:', JSON.stringify(tenants, null, 2));
  } catch (err) {
    console.error('Error fetching tenants:', err);
  } finally {
    await client.$disconnect();
  }
}

main();
