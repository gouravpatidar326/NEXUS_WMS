# Project Overview: NEXUS WMS Backend

## 1. Introduction
The Nexus Warehouse Management System (NEXUS WMS) backend is a production-grade Node.js and Express API designed to power the complete React-based frontend. It provides robust authentication, role-based access control, multi-tenant data isolation, and comprehensive inventory management features.

## 2. Local Development Setup (Prisma + MySQL)
The backend is designed to run locally using Prisma ORM connected to a MySQL database.
*   **Database**: MySQL (Local)
*   **ORM**: Prisma
*   **Environment Configuration**: A local `.env` file must define `DATABASE_URL` (pointing to the local MySQL instance) and `PORT` (defaulting to 3000).
*   **Prisma Setup**: The schema uses a single `schema.prisma` file. Migrations are applied using standard Prisma CLI commands (`npx prisma migrate dev`).

## 3. Cloud Deployment (Railway)
The backend is designed for seamless deployment to Railway without any code changes or environment-branching logic.
*   **Database Integration**: Railway provides a MySQL plugin. The Railway environment variable `DATABASE_URL` automatically connects Prisma to the cloud database.
*   **Port Binding**: The Express server dynamically binds to `process.env.PORT` provided by the Railway container.
*   **Build Pipeline**: The deployment requires no custom scripts or "hacks". The standard `npm install` and `npm start` (with `npx prisma generate` and `npx prisma migrate deploy` in the build step) are fully supported.

## 4. Platform Features
The backend supports all frontend functionality verified in the audit report, including:
*   **Authentication & RBAC**: JWT-based login, password recovery, and strict role guards (Super Admin, Warehouse Manager, Inventory Clerk, Client).
*   **Multi-Tenancy**: Company and Client data isolation.
*   **Product & Inventory Catalog**: Real-time stock ledgers, financial visibility guards (Item Cost/Wholesale Price).
*   **Batch & Expiry Tracking**: FEFO allocation, lot tracking, and quarantine status.
*   **COA Gating**: Secure, payment-locked 3rd-party test certificate (COA) access.
*   **Order Fulfillment**: End-to-end Sales Orders, Purchase Orders (with goods receiving), and Cross-Company Transfer Orders.
*   **Warehouse Operations**: Pick lists, packing, and barcode scanning for bin location updates.
*   **Shipping & Integration**: ShipStation-ready order export and label generation endpoints.
*   **System Admin**: Platform audit logs and global settings management.
