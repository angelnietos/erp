const http = require('http');
const querystring = require('querystring');

function request(url, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {}
    };

    if (postData) {
      if (typeof data === 'string') {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        options.headers['Content-Type'] = 'application/json';
      }
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(body ? JSON.parse(body) : null);
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`Failed ${method} ${urlObj.pathname}: Status ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function main() {
  try {
    console.log('Authenticating as admin...');
    const tokenRes = await request('http://localhost:8081/realms/master/protocol/openid-connect/token', 'POST', querystring.stringify({
      client_id: 'admin-cli',
      username: 'admin',
      password: 'admin',
      grant_type: 'password'
    }));
    const token = tokenRes.access_token;
    console.log('Authentication successful.');

    const realm = 'josanz-web-app-realm';
    
    // Fetch client scopes
    const scopesUrl = `http://localhost:8081/admin/realms/${realm}/client-scopes`;
    const scopes = await request(scopesUrl, 'GET', null, token);
    const scopeMap = {};
    scopes.forEach(s => {
      scopeMap[s.name] = s;
    });

    // 1. Configure Email Scope Mappers
    const emailScope = scopeMap['email'];
    if (emailScope) {
      console.log('Adding mappers to email scope...');
      const emailMappersUrl = `http://localhost:8081/admin/realms/${realm}/client-scopes/${emailScope.id}/protocol-mappers/models`;
      const existingMappers = await request(emailMappersUrl, 'GET', null, token);
      const existingMapperNames = existingMappers.map(m => m.name);

      const targetEmailMappers = [
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
            'jsonType.label': 'String'
          }
        },
        {
          name: 'email verified',
          protocol: 'openid-connect',
          protocolMapper: 'oidc-usermodel-property-mapper',
          config: {
            'userinfo.token.claim': 'true',
            'user.attribute': 'emailVerified',
            'id.token.claim': 'true',
            'access.token.claim': 'true',
            'claim.name': 'email_verified',
            'jsonType.label': 'boolean'
          }
        }
      ];

      for (const mapper of targetEmailMappers) {
        if (!existingMapperNames.includes(mapper.name)) {
          console.log(`Creating email mapper: ${mapper.name}`);
          await request(emailMappersUrl, 'POST', mapper, token);
        } else {
          console.log(`Email mapper already exists: ${mapper.name}`);
        }
      }
    }

    // 2. Configure Profile Scope Mappers
    const profileScope = scopeMap['profile'];
    if (profileScope) {
      console.log('Adding mappers to profile scope...');
      const profileMappersUrl = `http://localhost:8081/admin/realms/${realm}/client-scopes/${profileScope.id}/protocol-mappers/models`;
      const existingMappers = await request(profileMappersUrl, 'GET', null, token);
      const existingMapperNames = existingMappers.map(m => m.name);

      const targetProfileMappers = [
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
            'jsonType.label': 'String'
          }
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
            'jsonType.label': 'String'
          }
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
            'jsonType.label': 'String'
          }
        }
      ];

      for (const mapper of targetProfileMappers) {
        if (!existingMapperNames.includes(mapper.name)) {
          console.log(`Creating profile mapper: ${mapper.name}`);
          await request(profileMappersUrl, 'POST', mapper, token);
        } else {
          console.log(`Profile mapper already exists: ${mapper.name}`);
        }
      }
    }

    // 3. Configure Roles Scope Mappers
    const rolesScope = scopeMap['roles'];
    if (rolesScope) {
      console.log('Adding mappers to roles scope...');
      const rolesMappersUrl = `http://localhost:8081/admin/realms/${realm}/client-scopes/${rolesScope.id}/protocol-mappers/models`;
      const existingMappers = await request(rolesMappersUrl, 'GET', null, token);
      const existingMapperNames = existingMappers.map(m => m.name);

      const targetRolesMappers = [
        {
          name: 'realm roles',
          protocol: 'openid-connect',
          protocolMapper: 'oidc-usermodel-realm-role-mapper',
          config: {
            'multivalued': 'true',
            'userinfo.token.claim': 'true',
            'id.token.claim': 'true',
            'access.token.claim': 'true',
            'claim.name': 'realm_access.roles',
            'jsonType.label': 'String'
          }
        }
      ];

      for (const mapper of targetRolesMappers) {
        if (!existingMapperNames.includes(mapper.name)) {
          console.log(`Creating roles mapper: ${mapper.name}`);
          await request(rolesMappersUrl, 'POST', mapper, token);
        } else {
          console.log(`Roles mapper already exists: ${mapper.name}`);
        }
      }
    }

    // 4. Update josanz-web-app-spa client mappers
    const clientsUrl = `http://localhost:8081/admin/realms/${realm}/clients`;
    const clients = await request(clientsUrl, 'GET', null, token);
    const spaClient = clients.find(c => c.clientId === 'josanz-web-app-spa');
    if (spaClient) {
      console.log(`Updating mappers for client: ${spaClient.clientId} (${spaClient.id})`);
      const clientMappersUrl = `http://localhost:8081/admin/realms/${realm}/clients/${spaClient.id}/protocol-mappers/models`;
      const clientMappers = await request(clientMappersUrl, 'GET', null, token);
      
      // Look for tenant_id and client_roles
      const tenantIdMapper = clientMappers.find(m => m.name === 'tenant_id');
      const clientRolesMapper = clientMappers.find(m => m.name === 'client_roles');

      if (tenantIdMapper) {
        tenantIdMapper.config = {
          ...tenantIdMapper.config,
          'user.attribute': 'tenant_id', // CRITICAL FIX
          'userinfo.token.claim': 'true',
          'access.token.claim': 'true',
          'id.token.claim': 'true'
        };
        console.log('Updating tenant_id mapper...');
        await request(`${clientMappersUrl}/${tenantIdMapper.id}`, 'PUT', tenantIdMapper, token);
      }

      if (clientRolesMapper) {
        clientRolesMapper.config = {
          ...clientRolesMapper.config,
          'claim.name': 'client_roles',
          'client.id': 'josanz-web-app-spa',
          'userinfo.token.claim': 'true',
          'access.token.claim': 'true',
          'id.token.claim': 'true'
        };
        console.log('Updating client_roles mapper...');
        await request(`${clientMappersUrl}/${clientRolesMapper.id}`, 'PUT', clientRolesMapper, token);
      }
    }

    console.log('All Keycloak mappers successfully configured!');

  } catch (err) {
    console.error('Error configuring Keycloak mappers:', err.message);
  }
}

main();
