# Architecture Guidelines

## 1. Environment-Based Configuration
The application relies strictly on standard environment variables. There is no environment-specific branching logic in the codebase (e.g., `if (process.env.NODE_ENV === 'production')`).
*   `DATABASE_URL`: Connection string for the MySQL database.
*   `PORT`: The port on which the Express server listens.
*   `JWT_SECRET`: Secret key for signing JSON Web Tokens.

## 2. Server Startup & Shutdown Flow
The Express application is decoupled from the server initialization to facilitate testing and deployment.
*   `src/app.js`: Initializes Express, attaches middlewares (CORS, JSON parsing, logging), and mounts API routes.
*   `src/server.js`: Imports the `app` instance, reads `process.env.PORT` (falling back to 3000 locally), and starts the HTTP listener.
*   **Graceful Shutdown**: The server implements SIGTERM/SIGINT handlers to close the HTTP listener and disconnect from the Prisma client safely.

## 3. Database Connection Lifecycle (Prisma)
The database connection is managed entirely by Prisma.
*   A single Prisma client instance is instantiated in `src/utils/prisma.js` and shared across the application.
*   The client automatically manages connection pooling.
*   No database host, port, or user credentials are hard-coded in the application. Everything is derived from `DATABASE_URL`.
*   The single `schema.prisma` file is used across all environments. There are no local-only generators or SQLite fallbacks.

## 4. Module Structure
The application is organized into modules to keep responsibilities clean:
*   `src/modules/super-admin`: User management, roles, and global settings.
*   `src/modules/warehouse`: Inventory tracking, product catalog, batches, purchase/transfer orders, and barcode logic.
*   `src/modules/client`: Client portal features, order requests, and COA downloads.
*   `src/middlewares`: Role-based access control, JWT verification, and error handling.
