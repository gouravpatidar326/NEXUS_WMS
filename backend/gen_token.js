const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 1, role: 'SUPER_ADMIN' }, 'nexus_wms_secret_key_2026');
console.log(token);
