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

    // Fetch existing client scopes
    const scopesUrl = 'http://localhost:8081/admin/realms/josanz-web-app-realm/client-scopes';
    const existingScopes = await request(scopesUrl, 'GET', null, token);
    const scopeMap = {};
    existingScopes.forEach(s => {
      scopeMap[s.name] = s;
    });

    const standardScopes = ['openid', 'profile', 'email', 'roles', 'web-origins'];
    
    for (const scopeName of standardScopes) {
      if (!scopeMap[scopeName]) {
        console.log(`Creating client scope: ${scopeName}`);
        const newScope = {
          name: scopeName,
          protocol: 'openid-connect',
          attributes: {
            'include.in.token.scope': 'true',
            'display.on.consent.screen': 'true'
          }
        };
        const created = await request(scopesUrl, 'POST', newScope, token);
        // Refresh scopes to get the ID
        const currentScopes = await request(scopesUrl, 'GET', null, token);
        const found = currentScopes.find(s => s.name === scopeName);
        if (found) {
          scopeMap[scopeName] = found;
        }
      } else {
        console.log(`Client scope already exists: ${scopeName}`);
      }
    }

    // Get client UUID for josanz-web-app-spa
    const clientsUrl = 'http://localhost:8081/admin/realms/josanz-web-app-realm/clients';
    const clients = await request(clientsUrl, 'GET', null, token);
    const spaClient = clients.find(c => c.clientId === 'josanz-web-app-spa');
    if (!spaClient) {
      throw new Error('Could not find client josanz-web-app-spa');
    }
    console.log(`Found SPA client UUID: ${spaClient.id}`);

    // Assign default scopes to the client
    const defaultScopesUrl = `http://localhost:8081/admin/realms/josanz-web-app-realm/clients/${spaClient.id}/default-client-scopes`;
    const clientDefaultScopes = await request(defaultScopesUrl, 'GET', null, token);
    const clientDefaultScopeNames = clientDefaultScopes.map(s => s.name);

    for (const scopeName of standardScopes) {
      if (!clientDefaultScopeNames.includes(scopeName)) {
        console.log(`Adding ${scopeName} to default client scopes...`);
        const scopeId = scopeMap[scopeName].id;
        await request(`${defaultScopesUrl}/${scopeId}`, 'PUT', null, token);
      } else {
        console.log(`${scopeName} is already a default client scope.`);
      }
    }

    console.log('Keycloak scopes verification and configuration completed successfully.');

  } catch (err) {
    console.error('Error fixing Keycloak client scopes:', err.message);
  }
}

main();
