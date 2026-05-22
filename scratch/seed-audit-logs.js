const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5435/josanz_erp?schema=public"
  });
  await client.connect();

  const userRes = await client.query("SELECT id FROM platform_users WHERE email = 'platform@babooni.com' LIMIT 1");
  const platformUserId = userRes.rows[0]?.id || '00000000-0000-0000-0000-000000000000';

  const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = 'josanz' LIMIT 1");
  const josanzTenantId = tenantRes.rows[0]?.id;

  if (josanzTenantId) {
    const changesJson = JSON.stringify({
      tenantId: josanzTenantId,
      entityType: 'PRODUCT',
      entityName: 'Prueba Audit',
      details: 'Audit log insertado manualmente para pruebas'
    });

    await client.query(`
      INSERT INTO audit_logs (id, user_id, action, target_entity, correlation_id, changes_json, created_at)
      VALUES (
        gen_random_uuid(),
        $1,
        'CREATE',
        'Product:fake-id',
        gen_random_uuid(),
        $2,
        NOW()
      )
    `, [platformUserId, changesJson]);

    console.log('Seeded audit log for josanz tenant');
  }

  await client.end();
}

main().catch(console.error);
