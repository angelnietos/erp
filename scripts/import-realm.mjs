import fs from 'fs';
import http from 'http';

const postUrlEncoded = (url, dataStr) => new Promise((resolve, reject) => {
  const urlObj = new URL(url);
  const req = http.request({
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname + urlObj.search,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, (res) => {
    let str = '';
    res.on('data', c => str += c);
    res.on('end', () => resolve(str));
  });
  req.on('error', reject);
  req.write(dataStr);
  req.end();
});

const postJson = (url, data, token) => new Promise((resolve, reject) => {
  const urlObj = new URL(url);
  const body = JSON.stringify(data);
  const req = http.request({
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname + urlObj.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let str = '';
    res.on('data', c => str += c);
    res.on('end', () => resolve({status: res.statusCode, data: str}));
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

(async () => {
  try {
    console.log('Getting admin token...');
    const tokenStr = await postUrlEncoded('http://localhost:8081/realms/master/protocol/openid-connect/token', 
      'grant_type=password&client_id=admin-cli&username=admin&password=admin');
    const admin = JSON.parse(tokenStr);
    const token = admin.access_token;
    console.log('Token OK, importing realm...');
    
    const realm = JSON.parse(fs.readFileSync('docker/keycloak/realms/babooni-platform-realm.json', 'utf8'));
    const result = await postJson('http://localhost:8081/admin/realms', realm, token);
    console.log('Import result:', result.status, result.data);
    
    // Verify
    const listRes = await postJson('http://localhost:8081/admin/realms', {}, token);
    console.log('Available realms:', listRes.data);
  } catch(e) {
    console.error('Error:', e);
  }
})();