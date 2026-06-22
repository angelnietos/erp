#!/usr/bin/env node
/**
 * Sincroniza clientes Keycloak dev (ERP + panel SaaS).
 * El JSON del realm solo se importa en el primer arranque del contenedor.
 *
 * Uso: node scripts/keycloak-sync-dev.mjs
 * Env: KEYCLOAK_URL (default http://localhost:8081), KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD
 */
const KC_BASE = (process.env.KEYCLOAK_URL ?? 'http://localhost:8081').replace(/\/$/, '');
const ADMIN_USER = process.env.KEYCLOAK_ADMIN ?? 'admin';
const ADMIN_PASS = process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin';

const DEV_ORIGINS = ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4300'];

const PLATFORM_CALLBACK = 'http://localhost:4300/login/callback';

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

async function kc(token, realm, path, options = {}) {
  const res = await fetch(`${KC_BASE}/admin/realms/${realm}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  return res;
}

async function upsertClient(token, realm, clientId, payload) {
  const listRes = await kc(token, realm, `/clients?clientId=${encodeURIComponent(clientId)}`);
  if (!listRes.ok) {
    throw new Error(`List clients failed (${realm}): ${await listRes.text()}`);
  }
  const existing = await listRes.json();

  if (existing.length > 0) {
    const id = existing[0].id;
    const putRes = await kc(token, realm, `/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...existing[0], ...payload }),
    });
    if (!putRes.ok) {
      throw new Error(`Update client ${clientId} failed: ${await putRes.text()}`);
    }
    console.log(`✓ Cliente ${clientId} actualizado en ${realm} (${id})`);
    return id;
  }

  const createRes = await kc(token, realm, '/clients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (createRes.status !== 201) {
    throw new Error(`Create client ${clientId} failed (${createRes.status}): ${await createRes.text()}`);
  }
  const location = createRes.headers.get('location') ?? '';
  const id = location.split('/').pop();
  console.log(`✓ Cliente ${clientId} creado en ${realm} (${id})`);
  return id;
}

// --- ERP (josanz-web-app-realm) ---

const JOSANZ_REALM = 'josanz-web-app-realm';
const JOSANZ_CLIENT_ID = 'josanz-figma-spa';
const ALEXIS_TENANT_ID = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a';

function josanzClientPayload() {
  return {
    clientId: JOSANZ_CLIENT_ID,
    name: 'Josanz Figma SPA (Alexis)',
    description: 'Shell Figma / tenant alexis — login theme josanz-figma',
    enabled: true,
    publicClient: true,
    directAccessGrantsEnabled: true,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    serviceAccountsEnabled: false,
    protocol: 'openid-connect',
    webOrigins: [...DEV_ORIGINS],
    redirectUris: DEV_ORIGINS.map((o) => `${o}/*`),
    attributes: {
      'pkce.code.challenge.method': 'S256',
      login_theme: 'josanz-figma',
      'post.logout.redirect.uris':
        'http://localhost:4200/auth/login*+http://localhost:4201/auth/login*+http://localhost:4300/auth/login*+http://localhost:4300/login*',
    },
    defaultClientScopes: ['web-origins', 'roles', 'profile', 'email', 'openid'],
    optionalClientScopes: ['offline_access'],
  };
}

async function syncJosanzRealmLoginUx(token) {
  const getRes = await kc(token, JOSANZ_REALM, '');
  if (!getRes.ok) {
    throw new Error(`Read realm failed: ${await getRes.text()}`);
  }
  const realm = await getRes.json();
  const payload = {
    ...realm,
    internationalizationEnabled: true,
    supportedLocales: ['es', 'en'],
    defaultLocale: 'es',
    loginWithEmailAllowed: true,
    rememberMe: true,
    resetPasswordAllowed: true,
    registrationAllowed: false,
  };
  const putRes = await kc(token, JOSANZ_REALM, '', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!putRes.ok) {
    throw new Error(`Update realm login UX failed: ${await putRes.text()}`);
  }
  console.log(`✓ ${JOSANZ_REALM}: recordarme, recuperar contraseña e i18n (es)`);
}

async function ensureClientRoles(token, realm, clientUuid, clientId, roleNames) {
  for (const name of roleNames) {
    const listRes = await kc(token, realm, `/clients/${clientUuid}/roles?search=${name}`);
    const roles = listRes.ok ? await listRes.json() : [];
    if (roles.some((r) => r.name === name)) {
      continue;
    }
    const createRes = await kc(token, realm, `/clients/${clientUuid}/roles`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!createRes.ok && createRes.status !== 409) {
      throw new Error(`Create role ${name} failed: ${await createRes.text()}`);
    }
    console.log(`✓ Rol cliente ${clientId}/${name}`);
  }
}

async function upsertAlexisUser(token, clientUuid) {
  const email = 'admin@alexis.local';
  const listRes = await kc(token, JOSANZ_REALM, `/users?email=${encodeURIComponent(email)}&exact=true`);
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
    const putRes = await kc(token, JOSANZ_REALM, `/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userBody),
    });
    if (!putRes.ok) {
      throw new Error(`Update user failed: ${await putRes.text()}`);
    }
    console.log(`✓ Usuario ${email} actualizado`);
  } else {
    const createRes = await kc(token, JOSANZ_REALM, '/users', {
      method: 'POST',
      body: JSON.stringify(userBody),
    });
    if (createRes.status !== 201) {
      throw new Error(`Create user failed (${createRes.status}): ${await createRes.text()}`);
    }
    userId = (createRes.headers.get('location') ?? '').split('/').pop();
    console.log(`✓ Usuario ${email} creado`);
  }

  const pwRes = await kc(token, JOSANZ_REALM, `/users/${userId}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ type: 'password', value: 'Admin123!', temporary: false }),
  });
  if (!pwRes.ok) {
    throw new Error(`Set password failed: ${await pwRes.text()}`);
  }

  for (const roleName of ['admin', 'user']) {
    const roleRes = await kc(token, JOSANZ_REALM, `/clients/${clientUuid}/roles/${roleName}`);
    if (!roleRes.ok) continue;
    const role = await roleRes.json();
    await kc(token, JOSANZ_REALM, `/users/${userId}/role-mappings/clients/${clientUuid}`, {
      method: 'POST',
      body: JSON.stringify([role]),
    });
  }
  console.log(`✓ Roles ${JOSANZ_CLIENT_ID} asignados a ${email}`);
}

async function syncJosanzRealm(token) {
  console.log(`\n→ ${JOSANZ_REALM}`);
  await syncJosanzRealmLoginUx(token);
  const clientUuid = await upsertClient(token, JOSANZ_REALM, JOSANZ_CLIENT_ID, josanzClientPayload());
  await ensureClientRoles(token, JOSANZ_REALM, clientUuid, JOSANZ_CLIENT_ID, ['admin', 'user']);
  await upsertAlexisUser(token, clientUuid);
}

// --- Panel SaaS (babooni-platform) ---

const PLATFORM_REALM = 'babooni-platform';
const PLATFORM_CLIENT_ID = 'babooni-saas-platform';

function platformClientPayload() {
  const redirectUris = [
    ...DEV_ORIGINS.map((o) => `${o}/*`),
    PLATFORM_CALLBACK,
    'http://localhost:4300/login/callback',
    'http://localhost:4200/login/callback',
    'http://localhost:4201/login/callback',
  ];
  return {
    clientId: PLATFORM_CLIENT_ID,
    name: 'Babooni SaaS Platform',
    description: 'Admin panel for managing ERP tenants and modules',
    enabled: true,
    publicClient: true,
    directAccessGrantsEnabled: true,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    serviceAccountsEnabled: false,
    protocol: 'openid-connect',
    webOrigins: [...DEV_ORIGINS, '+'],
    redirectUris: [...new Set(redirectUris)],
    attributes: {
      'pkce.code.challenge.method': 'S256',
      'post.logout.redirect.uris':
        'http://localhost:4300/login*+http://localhost:4200/*+http://localhost:4201/*',
    },
    defaultClientScopes: ['web-origins', 'roles', 'profile', 'email', 'openid'],
    optionalClientScopes: ['offline_access'],
  };
}

async function syncPlatformRealm(token) {
  console.log(`\n→ ${PLATFORM_REALM}`);
  const clientUuid = await upsertClient(
    token,
    PLATFORM_REALM,
    PLATFORM_CLIENT_ID,
    platformClientPayload(),
  );
  console.log(`✓ Redirect PKCE panel: ${PLATFORM_CALLBACK}`);
  return clientUuid;
}

async function main() {
  console.log(`Keycloak sync → ${KC_BASE}`);
  const token = await getAdminToken();
  await syncJosanzRealm(token);
  await syncPlatformRealm(token);
  console.log('\nListo. ERP: /auth/login?tenant=alexis · SaaS: http://localhost:4300/login');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
