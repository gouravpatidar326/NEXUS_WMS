const fs = require('fs');

const models = [
  'AuditLog', 'Batch', 'Client', 'Company', 'InventoryLedger', 
  'Notification', 'PickList', 'PickListItem', 'Product', 
  'PurchaseOrder', 'SalesOrder', 'SalesOrderItem', 'SystemSettings', 
  'TransferOrder', 'User'
];

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Replace model definitions
for (const model of models) {
  const lower = model.toLowerCase();
  schema = schema.replace(new RegExp(`model ${lower} \\{`, 'g'), `model ${model} {\n  @@map("${lower}")`);
}

// Replace relations and references
for (const model of models) {
  const lower = model.toLowerCase();
  // e.g. "product       product " -> "product       Product "
  schema = schema.replace(new RegExp(`(\\w+\\s+)${lower}(\\?|\\[\\])?`, 'g'), `$1${model}$2`);
}

// Fix array properties specifically, e.g., "batch batch[]" -> "batch Batch[]"
// And optional, e.g., "user user?" -> "user User?"

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Fixed schema.prisma via RegExp');
