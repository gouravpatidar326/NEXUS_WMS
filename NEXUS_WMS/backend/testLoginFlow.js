const http = require('http');

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
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
    req.write(data);
    req.end();
  });
};

async function main() {
  try {
    console.log('1. Login as Super Admin (alex@stitchnexus.com)...');
    const loginRes = await request('POST', '/api/auth/login', { email: 'alex@stitchnexus.com', password: '123456' });
    const adminToken = loginRes.data.token;

    console.log('\n2. Admin Creates Manager (testmgr@test.com)...');
    const mgrRes = await request('POST', '/api/users', {
      name: 'Test Manager',
      email: 'testmgr@test.com',
      password: 'Test@123',
      role: 'WAREHOUSE_MANAGER',
      phone: '1234567890',
      jobTitle: 'Manager',
      companyId: 'b4b65243-eda4-4656-8348-0c12a2b8ccd7' // kiaan
    }, adminToken);
    
    console.log('\n3. Login as Manager (testmgr@test.com)...');
    const mgrLoginRes = await request('POST', '/api/auth/login', { email: 'testmgr@test.com', password: 'Test@123' });
    console.log('Manager Login Status:', mgrLoginRes.status);
    const mgrToken = mgrLoginRes.data.token;

    console.log('\n4. Manager Creates Clerk (testclerk2@test.com)...');
    const clerkRes = await request('POST', '/api/users', {
      name: 'Test Clerk 2',
      email: 'testclerk2@test.com',
      password: 'Test@123',
      role: 'INVENTORY_CLERK',
      phone: '1234567890',
      jobTitle: 'Clerk'
    }, mgrToken);
    console.log('Clerk Company ID Assigned:', clerkRes.data.user?.companyId);

    console.log('\n5. Login as Clerk (testclerk2@test.com)...');
    const clerkLoginRes = await request('POST', '/api/auth/login', { email: 'testclerk2@test.com', password: 'Test@123' });
    console.log('Clerk Login Status:', clerkLoginRes.status);
    console.log('Clerk Login Token Role:', clerkLoginRes.data.user?.role);
    console.log('Clerk Login Company ID:', clerkLoginRes.data.user?.companyId);

  } catch (err) {
    console.error('Test failed:', err);
  }
}

main();
