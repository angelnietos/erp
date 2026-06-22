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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const KC_THEMES = path.join(REPO_ROOT, 'docker', 'keycloak', 'themes');
const KC_DEV_LOGIN_THEMES = ['josanz-figma', 'babooni-platform', 'babooni-erp'];

function copyKeycloakDevLoginAssets() {
  const shared = path.join(KC_THEMES, '_shared', 'login', 'resources');
  for (const theme of KC_DEV_LOGIN_THEMES) {
    const target = path.join(KC_THEMES, theme, 'login', 'resources');
    fs.mkdirSync(path.join(target, 'js'), { recursive: true });
    fs.mkdirSync(path.join(target, 'css'), { recursive: true });
    fs.copyFileSync(
      path.join(shared, 'js', 'dev-login.js'),
      path.join(target, 'js', 'dev-login.js'),
    );
    fs.copyFileSync(
      path.join(shared, 'css', 'dev-login.css'),
      path.join(target, 'css', 'dev-login.css'),
    );
  }
  console.log(`✓ Temas KC: dev-login.js copiado a ${KC_DEV_LOGIN_THEMES.join(', ')}`);
}

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
const JOSANZ_WEB_SPA_CLIENT_ID = 'josanz-web-app-spa';
const ALEXIS_TENANT_ID = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a';

function josanzWebAppClientPayload() {
  return {
    clientId: JOSANZ_WEB_SPA_CLIENT_ID,
    name: 'Josanz Web App SPA',
    description: 'Angular SPA Josanz ERP (tenants josanz, …)',
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
        'http://localhost:4200/auth/login*+http://localhost:4200/auth/tenant*+http://localhost:4201/auth/login*+http://localhost:4300/auth/login*+http://localhost:4300/login*',
    },
    defaultClientScopes: ['web-origins', 'roles', 'profile', 'email', 'openid'],
    optionalClientScopes: ['offline_access'],
  };
}

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
        'http://localhost:4200/auth/login*+http://localhost:4200/auth/tenant*+http://localhost:4201/auth/login*+http://localhost:4300/auth/login*+http://localhost:4300/login*',
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
    loginTheme: 'josanz-figma',
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
  console.log(`✓ ${JOSANZ_REALM}: tema josanz-figma, i18n ES, recordarme`);
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
  await upsertClient(token, JOSANZ_REALM, JOSANZ_WEB_SPA_CLIENT_ID, josanzWebAppClientPayload());
  const clientUuid = await upsertClient(token, JOSANZ_REALM, JOSANZ_CLIENT_ID, josanzClientPayload());
  await ensureClientRoles(token, JOSANZ_REALM, clientUuid, JOSANZ_CLIENT_ID, ['admin', 'user']);
  await upsertAlexisUser(token, clientUuid);
}

// --- Babooni ERP tenant (babooni-tenant) ---

const BABOONI_TENANT_REALM = 'babooni-tenant';
const BABOONI_TENANT_CLIENT_ID = 'josanz-web-app-spa';

function babooniTenantClientPayload() {
  return {
    clientId: BABOONI_TENANT_CLIENT_ID,
    name: 'Josanz Web App SPA (Babooni)',
    description: 'ERP tenant babooni — login theme babooni-erp',
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
      login_theme: 'babooni-erp',
      'post.logout.redirect.uris':
        'http://localhost:4200/auth/login*+http://localhost:4201/auth/login*',
    },
    defaultClientScopes: ['web-origins', 'roles', 'profile', 'email', 'openid'],
    optionalClientScopes: ['offline_access'],
  };
}

async function syncBabooniTenantRealmLoginUx(token) {
  const getRes = await kc(token, BABOONI_TENANT_REALM, '');
  if (!getRes.ok) {
    throw new Error(`Read realm ${BABOONI_TENANT_REALM} failed: ${await getRes.text()}`);
  }
  const realm = await getRes.json();
  const putRes = await kc(token, BABOONI_TENANT_REALM, '', {
    method: 'PUT',
    body: JSON.stringify({
      ...realm,
      loginTheme: 'babooni-erp',
      internationalizationEnabled: true,
      supportedLocales: ['es', 'en'],
      defaultLocale: 'es',
      loginWithEmailAllowed: true,
      rememberMe: true,
      resetPasswordAllowed: true,
      registrationAllowed: false,
    }),
  });
  if (!putRes.ok) {
    throw new Error(`Update ${BABOONI_TENANT_REALM} login UX failed: ${await putRes.text()}`);
  }
  console.log(`✓ ${BABOONI_TENANT_REALM}: tema babooni-erp, i18n ES, recordarme`);
}

async function syncBabooniTenantRealm(token) {
  console.log(`\n→ ${BABOONI_TENANT_REALM}`);
  await syncBabooniTenantRealmLoginUx(token);
  await upsertClient(
    token,
    BABOONI_TENANT_REALM,
    BABOONI_TENANT_CLIENT_ID,
    babooniTenantClientPayload(),
  );
}

// --- Panel SaaS (babooni-platform) ---

const PLATFORM_REALM = 'babooni-platform';
const PLATFORM_CLIENT_ID = 'babooni-saas-platform';

const PLATFORM_DEFAULT_SCOPES = [
  'web-origins',
  'roles',
  'profile',
  'email',
  'openid',
];

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
      login_theme: 'babooni-platform',
      'post.logout.redirect.uris':
        'http://localhost:4300/login*+http://localhost:4200/*+http://localhost:4201/*',
    },
    defaultClientScopes: [...PLATFORM_DEFAULT_SCOPES],
    optionalClientScopes: ['offline_access'],
  };
}

async function listRealmClientScopes(token, realm) {
  const res = await kc(token, realm, '/client-scopes');
  if (!res.ok) {
    throw new Error(`List client scopes failed (${realm}): ${await res.text()}`);
  }
  return res.json();
}

async function ensureRealmClientScope(token, realm, scopeDef) {
  const scopes = await listRealmClientScopes(token, realm);
  const existing = scopes.find((s) => s.name === scopeDef.name);
  if (existing) {
    return existing.id;
  }

  const createRes = await kc(token, realm, '/client-scopes', {
    method: 'POST',
    body: JSON.stringify(scopeDef),
  });
  if (createRes.status !== 201) {
    throw new Error(
      `Create client scope ${scopeDef.name} failed (${createRes.status}): ${await createRes.text()}`,
    );
  }
  const location = createRes.headers.get('location') ?? '';
  const id = location.split('/').pop();
  console.log(`✓ Client scope ${scopeDef.name} creado en ${realm}`);
  return id;
}

async function ensurePlatformClientScopes(token) {
  await ensureRealmClientScope(token, PLATFORM_REALM, {
    name: 'openid',
    protocol: 'openid-connect',
    attributes: {
      'include.in.token.scope': 'true',
      'display.on.consent.screen': 'true',
    },
  });
  await ensureRealmClientScope(token, PLATFORM_REALM, {
    name: 'email',
    protocol: 'openid-connect',
    attributes: {
      'include.in.token.scope': 'true',
      'display.on.consent.screen': 'true',
    },
    protocolMappers: [
      {
        name: 'email',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-property-mapper',
        config: {
          'userinfo.token.claim': 'true',
          'user.attribute': 'email',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'claim.name': 'email',
          'jsonType.label': 'String',
        },
      },
    ],
  });
  await ensureRealmClientScope(token, PLATFORM_REALM, {
    name: 'profile',
    protocol: 'openid-connect',
    attributes: {
      'include.in.token.scope': 'true',
      'display.on.consent.screen': 'true',
    },
    protocolMappers: [
      {
        name: 'username',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-property-mapper',
        config: {
          'userinfo.token.claim': 'true',
          'user.attribute': 'username',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'claim.name': 'preferred_username',
          'jsonType.label': 'String',
        },
      },
      {
        name: 'first name',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-property-mapper',
        config: {
          'userinfo.token.claim': 'true',
          'user.attribute': 'firstName',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'claim.name': 'given_name',
          'jsonType.label': 'String',
        },
      },
      {
        name: 'last name',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-property-mapper',
        config: {
          'userinfo.token.claim': 'true',
          'user.attribute': 'lastName',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'claim.name': 'family_name',
          'jsonType.label': 'String',
        },
      },
    ],
  });
  await ensureRealmClientScope(token, PLATFORM_REALM, {
    name: 'roles',
    protocol: 'openid-connect',
    attributes: {
      'include.in.token.scope': 'true',
      'display.on.consent.screen': 'true',
    },
    protocolMappers: [
      {
        name: 'realm roles',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-realm-role-mapper',
        config: {
          multivalued: 'true',
          'userinfo.token.claim': 'true',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'claim.name': 'realm_access.roles',
          'jsonType.label': 'String',
        },
      },
    ],
  });
  await ensureRealmClientScope(token, PLATFORM_REALM, {
    name: 'web-origins',
    protocol: 'openid-connect',
    attributes: {
      'include.in.token.scope': 'false',
      'display.on.consent.screen': 'false',
    },
  });
}

async function assignDefaultClientScopes(token, realm, clientUuid, scopeNames) {
  const allScopes = await listRealmClientScopes(token, realm);
  const currentRes = await kc(token, realm, `/clients/${clientUuid}/default-client-scopes`);
  const current = currentRes.ok ? await currentRes.json() : [];
  const currentIds = new Set(current.map((s) => s.id));

  for (const name of scopeNames) {
    const scope = allScopes.find((s) => s.name === name);
    if (!scope?.id) {
      console.warn(`⚠ Client scope "${name}" no encontrado en ${realm}`);
      continue;
    }
    if (currentIds.has(scope.id)) {
      continue;
    }
    const putRes = await kc(
      token,
      realm,
      `/clients/${clientUuid}/default-client-scopes/${scope.id}`,
      { method: 'PUT' },
    );
    if (!putRes.ok) {
      throw new Error(`Assign default scope ${name} failed: ${await putRes.text()}`);
    }
    console.log(`✓ Scope ${name} asignado al cliente`);
  }
}

async function syncPlatformRealmLoginUx(token) {
  const getRes = await kc(token, PLATFORM_REALM, '');
  if (!getRes.ok) {
    throw new Error(`Read realm ${PLATFORM_REALM} failed: ${await getRes.text()}`);
  }
  const realm = await getRes.json();
  const putRes = await kc(token, PLATFORM_REALM, '', {
    method: 'PUT',
    body: JSON.stringify({
      ...realm,
      loginTheme: 'babooni-platform',
      internationalizationEnabled: true,
      supportedLocales: ['es', 'en'],
      defaultLocale: 'es',
      loginWithEmailAllowed: true,
      rememberMe: true,
      resetPasswordAllowed: true,
      registrationAllowed: false,
    }),
  });
  if (!putRes.ok) {
    throw new Error(`Update ${PLATFORM_REALM} login UX failed: ${await putRes.text()}`);
  }
  console.log(`✓ ${PLATFORM_REALM}: tema babooni-platform, i18n ES, recordarme`);
}

async function syncPlatformRealm(token) {
  console.log(`\n→ ${PLATFORM_REALM}`);
  await syncPlatformRealmLoginUx(token);
  await ensurePlatformClientScopes(token);
  const clientUuid = await upsertClient(
    token,
    PLATFORM_REALM,
    PLATFORM_CLIENT_ID,
    platformClientPayload(),
  );
  await assignDefaultClientScopes(
    token,
    PLATFORM_REALM,
    clientUuid,
    PLATFORM_DEFAULT_SCOPES,
  );
  console.log(`✓ Redirect PKCE panel: ${PLATFORM_CALLBACK}`);
  return clientUuid;
}

async function main() {
  copyKeycloakDevLoginAssets();
  console.log(`Keycloak sync → ${KC_BASE}`);
  const token = await getAdminToken();
  await syncJosanzRealm(token);
  await syncBabooniTenantRealm(token);
  await syncPlatformRealm(token);
  console.log('\nListo. ERP: /auth/tenant · SaaS: http://localhost:4300/login');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
