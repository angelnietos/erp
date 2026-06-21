#!/usr/bin/env node
/**
 * Sincroniza cliente josanz-figma-spa + usuario alexis en Keycloak dev
 * (el JSON del realm solo se importa en el primer arranque del contenedor).
 *
 * Uso: node scripts/keycloak-sync-dev.mjs
 * Env: KEYCLOAK_URL (default http://localhost:8081), KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD
 */
const KC_BASE = (process.env.KEYCLOAK_URL ?? 'http://localhost:8081').replace(/\/$/, '');
const ADMIN_USER = process.env.KEYCLOAK_ADMIN ?? 'admin';
const ADMIN_PASS = process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin';
const REALM = 'josanz-web-app-realm';
const CLIENT_ID = 'josanz-figma-spa';
const ALEXIS_TENANT_ID = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a';

async function getAdminToken() {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: 'admin-cli',
    username: ADMIN_USER,
    password: ADMIN_PASS,
  });
  const res = await fetch(`${KC_BASE}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    throw new Error(`Admin login failed (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token;
}

async function kc(token, path, options = {}) {
  const res = await fetch(`${KC_BASE}/admin/realms/${REALM}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  return res;
}

function clientPayload() {
  return {
    clientId: CLIENT_ID,
    name: 'Josanz Figma SPA (Alexis)',
    description: 'Shell Figma / tenant alexis — login theme josanz-figma',
    enabled: true,
    publicClient: true,
    directAccessGrantsEnabled: true,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    serviceAccountsEnabled: false,
    protocol: 'openid-connect',
    webOrigins: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4300'],
    redirectUris: [
      'http://localhost:4200/*',
      'http://localhost:4201/*',
      'http://localhost:4300/*',
    ],
    attributes: {
      'pkce.code.challenge.method': 'S256',
      login_theme: 'josanz-figma',
      'post.logout.redirect.uris':
        'http://localhost:4200/auth/login*+http://localhost:4201/auth/login*+http://localhost:4300/auth/login*',
    },
    defaultClientScopes: ['web-origins', 'roles', 'profile', 'email', 'openid'],
    optionalClientScopes: ['offline_access'],
  };
}

async function upsertClient(token) {
  const listRes = await kc(token, `/clients?clientId=${encodeURIComponent(CLIENT_ID)}`);
  if (!listRes.ok) {
    throw new Error(`List clients failed: ${await listRes.text()}`);
  }
  const existing = await listRes.json();
  const payload = clientPayload();

  if (existing.length > 0) {
    const id = existing[0].id;
    const putRes = await kc(token, `/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...existing[0], ...payload }),
    });
    if (!putRes.ok) {
      throw new Error(`Update client failed: ${await putRes.text()}`);
    }
    console.log(`✓ Cliente ${CLIENT_ID} actualizado (${id})`);
    return id;
  }

  const createRes = await kc(token, '/clients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (createRes.status !== 201) {
    throw new Error(`Create client failed (${createRes.status}): ${await createRes.text()}`);
  }
  const location = createRes.headers.get('location') ?? '';
  const id = location.split('/').pop();
  console.log(`✓ Cliente ${CLIENT_ID} creado (${id})`);
  return id;
}

async function ensureClientRoles(token, clientUuid) {
  for (const name of ['admin', 'user']) {
    const listRes = await kc(token, `/clients/${clientUuid}/roles?search=${name}`);
    const roles = listRes.ok ? await listRes.json() : [];
    if (roles.some((r) => r.name === name)) {
      continue;
    }
    const createRes = await kc(token, `/clients/${clientUuid}/roles`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!createRes.ok && createRes.status !== 409) {
      throw new Error(`Create role ${name} failed: ${await createRes.text()}`);
    }
    console.log(`✓ Rol cliente ${CLIENT_ID}/${name}`);
  }
}

async function upsertAlexisUser(token, clientUuid) {
  const email = 'admin@alexis.local';
  const listRes = await kc(token, `/users?email=${encodeURIComponent(email)}&exact=true`);
  const users = listRes.ok ? await listRes.json() : [];
  let userId = users[0]?.id;

  const userBody = {
    username: 'alexis-admin',
    email,
    firstName: 'Admin',
    lastName: 'Alexis',
    enabled: true,
    emailVerified: true,
    attributes: { tenant_id: [ALEXIS_TENANT_ID] },
  };

  if (userId) {
    const putRes = await kc(token, `/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userBody),
    });
    if (!putRes.ok) {
      throw new Error(`Update user failed: ${await putRes.text()}`);
    }
    console.log(`✓ Usuario ${email} actualizado`);
  } else {
    const createRes = await kc(token, '/users', {
      method: 'POST',
      body: JSON.stringify(userBody),
    });
    if (createRes.status !== 201) {
      throw new Error(`Create user failed (${createRes.status}): ${await createRes.text()}`);
    }
    userId = (createRes.headers.get('location') ?? '').split('/').pop();
    console.log(`✓ Usuario ${email} creado`);
  }

  const pwRes = await kc(token, `/users/${userId}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ type: 'password', value: 'Admin123!', temporary: false }),
  });
  if (!pwRes.ok) {
    throw new Error(`Set password failed: ${await pwRes.text()}`);
  }

  for (const roleName of ['admin', 'user']) {
    const roleRes = await kc(token, `/clients/${clientUuid}/roles/${roleName}`);
    if (!roleRes.ok) continue;
    const role = await roleRes.json();
    await kc(token, `/users/${userId}/role-mappings/clients/${clientUuid}`, {
      method: 'POST',
      body: JSON.stringify([role]),
    });
  }
  console.log(`✓ Roles ${CLIENT_ID} asignados a ${email}`);
}

async function main() {
  console.log(`Keycloak sync → ${KC_BASE} / ${REALM}`);
  const token = await getAdminToken();
  const clientUuid = await upsertClient(token);
  await ensureClientRoles(token, clientUuid);
  await upsertAlexisUser(token, clientUuid);
  console.log('Listo. Prueba PKCE en /auth/login?tenant=alexis');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
