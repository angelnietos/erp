const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  try {
    const dmmf = prisma._dmmf;
    const roleModel = dmmf.datamodel.models.find(m => m.name === 'Role');
    console.log('Role Model Fields:', JSON.stringify(roleModel.fields.map(f => f.name), null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
