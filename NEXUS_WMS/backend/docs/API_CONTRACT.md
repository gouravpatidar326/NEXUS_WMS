# API Contract

## 1. Authentication & Users
*   **Login**
    *   `POST /api/auth/login`
    *   Auth: None
    *   Body: `{ email, password }`
    *   Response: `{ token, user: { id, role, name, companyId } }`
*   **Forgot Password**
    *   `POST /api/auth/forgot-password`
    *   Auth: None
    *   Body: `{ email }`
    *   Response: `{ message: "Reset link sent" }`
*   **Get Users**
    *   `GET /api/users`
    *   Auth: Required (Super Admin)
    *   Response: `[{ id, name, email, role, companyId, status }]`
*   **Invite User**
    *   `POST /api/users`
    *   Auth: Required (Super Admin)
    *   Body: `{ name, email, role, companyId }`
    *   Response: `{ id, message: "User invited" }`

## 2. Multi-Tenancy (Companies & Clients)
*   **Get Companies**
    *   `GET /api/companies`
    *   Auth: Required (Super Admin)
    *   Response: `[{ id, name, industry, orderValue, inventoryValue }]`
*   **Create Company**
    *   `POST /api/companies`
    *   Auth: Required (Super Admin)
    *   Body: `{ name, industry }`
    *   Response: `{ id, name }`
*   **Get Clients**
    *   `GET /api/clients`
    *   Auth: Required (Super Admin)
    *   Response: `[{ id, name, creditLimit, tier }]`

## 3. Product Catalog
*   **Get Products**
    *   `GET /api/products`
    *   Auth: Required (All roles)
    *   Response: `[{ id, sku, name, category, status, unitCost, wholesalePrice, availableStock, committedStock }]`
    *   *Note: `unitCost` and `margin` are omitted from the response if the user role is Client.*
*   **Create Product**
    *   `POST /api/products`
    *   Auth: Required (Manager, Admin)
    *   Body: `{ sku, name, category, unitCost, wholesalePrice }`
    *   Response: `{ id, sku }`

## 4. Inventory & Batches
*   **Get Inventory Ledger**
    *   `GET /api/inventory`
    *   Auth: Required (Admin, Manager, Clerk)
    *   Response: `[{ id, productId, location, quantity, type, date }]`
*   **Adjust Stock**
    *   `POST /api/inventory/adjust`
    *   Auth: Required (Manager, Clerk)
    *   Body: `{ productId, location, deltaQuantity, reason }`
    *   Response: `{ id, status: "Adjusted" }`
*   **Get Batches (Lots)**
    *   `GET /api/batches`
    *   Auth: Required (Admin, Manager, Clerk)
    *   Response: `[{ id, lotId, productId, expiryDate, quarantine, coaLocked, testCertificateId }]`
*   **Unlock COA Payment**
    *   `POST /api/batches/:id/unlock-coa`
    *   Auth: Required (Client, Manager)
    *   Body: `{ paymentToken }`
    *   Response: `{ id, coaLocked: false, message: "Unlocked successfully" }`

## 5. Orders (Purchase, Transfer, Sales)
*   **Get Purchase Orders**
    *   `GET /api/purchase-orders`
    *   Auth: Required (Admin, Manager, Clerk)
    *   Response: `[{ id, supplier, expectedDelivery, total, status }]`
*   **Receive PO Goods**
    *   `POST /api/purchase-orders/:id/receive`
    *   Auth: Required (Manager, Clerk)
    *   Body: `{ lots: [{ lotId, mfgDate, binLocation, quantity }] }`
    *   Response: `{ id, status: "Received" }`
*   **Create Transfer Order**
    *   `POST /api/transfer-orders`
    *   Auth: Required (Admin, Manager)
    *   Body: `{ sourceCompanyId, destinationCompanyId, productId, quantity }`
    *   Response: `{ id, status: "Pending" }`
*   **Submit Sales Order (Client Request)**
    *   `POST /api/sales-orders`
    *   Auth: Required (Client)
    *   Body: `{ items: [{ productId, quantity }] }`
    *   Response: `{ id, status: "Pending Review" }`
*   **Approve Sales Order**
    *   `POST /api/sales-orders/:id/approve`
    *   Auth: Required (Manager)
    *   Response: `{ id, status: "Picking" }`
    *   *Note: Automatically reserves `committedStock` in the backend.*
*   **Reject Sales Order**
    *   `POST /api/sales-orders/:id/reject`
    *   Auth: Required (Manager)
    *   Body: `{ reason }`
    *   Response: `{ id, status: "Rejected" }`

## 6. Warehouse Operations & Shipping
*   **Get Pick Lists**
    *   `GET /api/pick-lists`
    *   Auth: Required (Manager, Clerk)
    *   Response: `[{ id, orderId, items: [{ productId, lotId, binLocation, quantity, picked }] }]`
*   **Complete Pick**
    *   `POST /api/pick-lists/:id/pick`
    *   Auth: Required (Clerk)
    *   Body: `{ items: [{ productId, pickedQuantity }] }`
    *   Response: `{ id, status: "Picked" }`
*   **Update Bin Location (Barcode Scan)**
    *   `POST /api/locations/update`
    *   Auth: Required (Manager, Clerk)
    *   Body: `{ barcode, newLocation }`
    *   Response: `{ status: "Location Updated" }`
*   **Generate Shipping Label**
    *   `POST /api/shipping/label`
    *   Auth: Required (Manager, Clerk)
    *   Body: `{ orderId, carrier }`
    *   Response: `{ trackingId, labelUrl }`

## 7. System
*   **Get Dashboard Stats**
    *   `GET /api/dashboard/stats`
    *   Auth: Required (All roles)
    *   Response: Depends on role (e.g., expiry risk for manager, active shipments for client).
*   **Get Audit Logs**
    *   `GET /api/audit-logs`
    *   Auth: Required (Super Admin)
    *   Response: `[{ id, event, user, timestamp, ipAddress }]`
