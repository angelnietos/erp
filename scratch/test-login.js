const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../apps/backend/.env') });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const { Pool } = require('pg');
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testUser(email, password, tenantSlug) {
  console.log(`Testing login for ${email} on tenant ${tenantSlug}...`);
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
    if (!tenant) {
      console.log(`Tenant slug ${tenantSlug} not found!`);
      return;
    }
    console.log(`Resolved tenant ID: ${tenant.id}`);

    const user = await prisma.user.findFirst({
      where: { email, tenantId: tenant.id },
    });
    if (!user) {
      console.log(`User ${email} not found in tenant ${tenantSlug}!`);
      return;
    }
    console.log(`User found. ID: ${user.id}, Active: ${user.isActive}`);
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log(`Password comparison result: ${isPasswordCorrect}`);
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  await testUser('root@babooni.com', 'Admin123!', 'babooni');
  await testUser('admin@josanz.com', 'Admin123!', 'josanz');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
