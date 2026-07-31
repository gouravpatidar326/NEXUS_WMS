const http = require('http');

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    let data;
    if (body) {
      data = JSON.stringify(body);
    }
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {}
    };
    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = data.length;
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (data) req.write(data);
    req.end();
  });
};

async function main() {
  try {
    const loginRes = await request('POST', '/api/auth/login', { email: 'alex@stitchnexus.com', password: '123456' });
    const token = loginRes.data.token;
    
    const rolesRes = await request('GET', '/api/roles', null, token);
    console.log("Roles Res:", rolesRes.data);
    
    if (Array.isArray(rolesRes.data)) {
      const manager = rolesRes.data.find(r => r.key === 'WAREHOUSE_MANAGER');
      const clerk = rolesRes.data.find(r => r.key === 'INVENTORY_CLERK');
      console.log("WAREHOUSE_MANAGER has clients.view:", manager.permissions.includes('clients.view'));
      console.log("WAREHOUSE_MANAGER has users.view:", manager.permissions.includes('users.view'));
      console.log("INVENTORY_CLERK has warehouse.view:", clerk.permissions.includes('warehouse.view'));
    }
    
  } catch(e) {
    console.error(e);
  }
}
main();
