const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5435/josanz_erp?schema=public"
  });
  await client.connect();
  const res = await client.query('SELECT COUNT(*) FROM audit_logs');
  console.log('Total logs:', res.rows[0].count);
  
  const logs = await client.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5');
  console.log('Latest logs:', JSON.stringify(logs.rows, null, 2));

  await client.end();
}

main().catch(console.error);
