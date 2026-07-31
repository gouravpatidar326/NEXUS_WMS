# Business Rules & Logic

## 1. Role-Based Access Control (RBAC) Enforcements
The backend must enforce strict data visibility and action permissions based on the JWT role:
*   **Super Admin**: Has global access to all endpoints, companies, clients, and platform audit logs. Only role allowed to invite new users or manage global settings.
*   **Warehouse Manager**: Can approve/reject sales orders, adjust stock levels, initiate transfer orders, and manage batches/expiry dates. Cannot view global audit logs or system settings.
*   **Inventory Clerk**: Can view inventory, execute pick lists, process goods receipts (PO receiving), and update bin locations via barcode scans. Cannot approve sales orders or adjust global catalog pricing.
*   **Client**: Can only view their own company's order requests and shipments. Cannot view `unitCost` or `margin` fields in the product catalog. Can submit order requests.

## 2. Multi-Tenancy Data Isolation
*   All data queries (products, orders, batches, inventory) must be scoped to the `companyId` associated with the requesting user's token.
*   Cross-company transfer orders involve two `companyId`s (Source and Destination) and require Admin/Manager authorization to execute inter-facility double-entry ledger updates.

## 3. Order Fulfillment State Machine
*   **Client Order Request**: Starts as `Pending Review`.
*   **Approval Workflow**: When a Manager approves an order, the status becomes `Picking`. The backend must **transactionally deduct** the requested quantity from `availableStock` and add it to `committedStock` to prevent overselling.
*   **Rejection**: Requires a mandatory `reason` string to be saved and returned to the client.
*   **Transfer Orders**: Must transactionally deduct stock from the source warehouse and credit stock to the destination warehouse.

## 4. Goods Receiving & Batch Tracking
*   **PO Receiving**: Receiving goods must automatically generate new Lot IDs (or prompt for them) and require manufacturing/expiry dates.
*   **FEFO Allocation**: The backend must sort available lots by First-Expired-First-Out (FEFO) when generating pick lists.
*   **COA Payment Gating**: Third-party lab test certificates (COAs) are locked by default (`coaLocked: true`). A successful payment transaction unlocks the COA for the specific Client/Tenant account persistently in the database, allowing subsequent PDF downloads without re-payment.

## 5. Security Validations
*   All APIs must validate request bodies (e.g., ensuring required fields like `sku` or `quantity` are present).
*   File downloads (like the COA PDF) must be protected by short-lived signed URLs or authenticated proxy routes, ensuring direct asset URLs are not exposed.
*   Critical actions (stock adjustments, role changes, payment unlocks) must be logged in the `AuditLog` table.
