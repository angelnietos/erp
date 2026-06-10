const http = require('http');
const querystring = require('querystring');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = querystring.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function decodeToken(token) {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  return JSON.parse(Buffer.from(parts[1], 'base64').toString());
}

async function main() {
  try {
    const tokenRes = await post('http://localhost:8081/realms/josanz-web-app-realm/protocol/openid-connect/token', {
      client_id: 'josanz-web-app-spa',
      username: 'admin',
      password: 'admin',
      grant_type: 'password',
      scope: 'openid email profile'
    });
    console.log('Token Response successfully obtained.');
    console.log('\nDecoded Access Token Payload:');
    console.log(JSON.stringify(decodeToken(tokenRes.access_token), null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
