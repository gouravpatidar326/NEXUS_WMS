const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { 
    id: '58ba0c06-be0f-4eab-bf95-80e76a3fbf18',
    role: 'WAREHOUSE_MANAGER',
    companyId: '5dcb3379-9345-4c16-930e-2ebd184e8a1c'
  }, 
  'nexus_wms_secret_key_2026', 
  { expiresIn: '1h' }
);

fetch('http://localhost:5000/v1/barcodes/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ code: '1245365674' })
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(console.log)
.catch(console.error);
