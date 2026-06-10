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
    const tenantId = 'c363035a-2a98-4054-9207-38c8aa5732d9'; // Josanz Audiovisuales ID

    // Fetch all users in realm
    const usersUrl = `http://localhost:8081/admin/realms/${realm}/users`;
    const users = await request(usersUrl, 'GET', null, token);
    
    for (const user of users) {
      if (user.username === 'admin' || user.username === 'user') {
        console.log(`Updating user: ${user.username} (${user.id})`);
        
        // Merge attributes
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            tenant_id: [tenantId]
          }
        };

        await request(`${usersUrl}/${user.id}`, 'PUT', updatedUser, token);
        console.log(`User ${user.username} updated with tenant_id attribute.`);
      }
    }

    console.log('Keycloak users updated successfully.');

  } catch (err) {
    console.error('Error updating Keycloak users:', err.message);
  }
}

main();
