const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.auditLog.count();
  console.log('Total audit logs in DB:', count);
  if (count > 0) {
    const logs = await prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
    console.log('Latest logs:', JSON.stringify(logs, null, 2));
  } else {
    console.log('No logs found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
