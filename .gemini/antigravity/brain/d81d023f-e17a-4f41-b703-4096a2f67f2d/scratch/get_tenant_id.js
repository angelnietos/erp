const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'josanz' } });
  console.log('=> NEW_TENANT_ID:', tenant?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
