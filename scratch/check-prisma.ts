import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();
  const dmmf = (prisma as any)._dmmf;
  const roleModel = dmmf.datamodel.models.find(m => m.name === 'Role');
  console.log('Role Model Fields:', JSON.stringify(roleModel.fields.map(f => f.name), null, 2));
  await prisma.$disconnect();
}

test();
