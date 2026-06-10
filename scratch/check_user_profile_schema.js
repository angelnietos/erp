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
    const tokenRes = await request('http://localhost:8081/realms/master/protocol/openid-connect/token', 'POST', querystring.stringify({
      client_id: 'admin-cli',
      username: 'admin',
      password: 'admin',
      grant_type: 'password'
    }));
    const token = tokenRes.access_token;
    
    const realm = 'josanz-web-app-realm';
    const schema = await request(`http://localhost:8081/admin/realms/${realm}/users/profile`, 'GET', null, token);
    console.log('User Profile Schema:', JSON.stringify(schema, null, 2));

  } catch (err) {
    console.error(err);
  }
}

main();
