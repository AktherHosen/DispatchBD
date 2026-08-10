# Step-by-Step Build Instructions

## Step 1: Install Tools

Required:

- Node.js 20+
- pnpm
- MongoDB local or MongoDB Atlas
- Redis local or Upstash
- Git

Install pnpm:

    npm install -g pnpm

## Step 2: Install Dependencies

From project root:

    pnpm install

## Step 3: Start Local Services

    docker compose up -d

This starts:

- MongoDB on port 27017
- Redis on port 6379

## Step 4: Configure Environment

Create API env:

    cp apps/api/.env.example apps/api/.env

Create web env:

    cp apps/web/.env.example apps/web/.env

## Step 5: Run Backend

    pnpm --filter api dev

Expected:

    MongoDB connected
    API running on port 5000

Health check:

    http://localhost:5000/health

## Step 6: Run Frontend

    pnpm --filter web dev

Open:

    http://localhost:5173

## Step 7: Build Auth Backend

Create:

    models/User.ts
    controllers/auth.controller.ts
    routes/auth.routes.ts
    middlewares/auth.middleware.ts

Implement:

    POST /api/auth/register
    POST /api/auth/login
    POST /api/auth/logout
    POST /api/auth/refresh
    GET /api/auth/me

## Step 8: Build Workspace System

Create:

    models/Workspace.ts
    models/WorkspaceMember.ts
    middlewares/workspace.middleware.ts

Rules:

- every protected request must resolve active workspace
- user must be a member of workspace
- role must be checked for protected actions

## Step 9: Build Frontend Auth Pages

Create:

    pages/LoginPage.tsx
    pages/RegisterPage.tsx

Use:

- React Hook Form
- Zod
- TanStack Query mutation

## Step 10: Build App Layout

Create:

    components/layout/AppLayout.tsx
    components/layout/Sidebar.tsx
    components/layout/Topbar.tsx

Sidebar sections:

    Dashboard
    Store
    Courier
    Fraud Check
    Moderators
    API and Documentation
    Plans
    Settings

## Step 11: Build Store Connections

Backend:

    models/StoreConnection.ts
    controllers/storeConnection.controller.ts
    routes/storeConnection.routes.ts
    services/woocommerce.service.ts

Frontend:

    features/store/StoreConnectionsPage.tsx
    features/store/StoreConnectionCreatePage.tsx

## Step 12: Build Store Orders

Backend:

    models/StoreOrder.ts
    controllers/storeOrder.controller.ts
    routes/storeOrder.routes.ts
    services/storeOrderSync.service.ts

Frontend:

    features/store/StoreOrdersPage.tsx
    features/store/StoreOrderDetailsPage.tsx

## Step 13: Build Courier Connections

Backend:

    models/CourierConnection.ts
    controllers/courierConnection.controller.ts
    routes/courierConnection.routes.ts
    services/courier.service.ts

Frontend:

    features/courier/CourierConnectionsPage.tsx

## Step 14: Build Courier Orders

Backend:

    models/CourierOrder.ts
    controllers/courierOrder.controller.ts
    routes/courierOrder.routes.ts

Frontend:

    features/courier/CourierOrdersPage.tsx
    features/courier/CourierOrderDetailsPage.tsx

## Step 15: Build Fraud Check

Backend:

    models/FraudCheckLog.ts
    controllers/fraudCheck.controller.ts
    services/fraudCheck.service.ts

Frontend:

    features/fraud/FraudCheckPage.tsx

## Step 16: Build Analytics

Backend:

    services/analytics.service.ts
    controllers/analytics.controller.ts
    routes/analytics.routes.ts

Frontend:

    features/dashboard/StatCard.tsx
    features/dashboard/SalesChart.tsx
    features/dashboard/OrdersByCourierChart.tsx

## Step 17: Build Billing

Backend:

    models/Plan.ts
    models/Subscription.ts
    controllers/billing.controller.ts
    services/payment.service.ts

Frontend:

    features/billing/PlansPage.tsx
    features/billing/BillingSettingsPage.tsx

## Step 18: Build API Keys

Backend:

    models/ApiKey.ts
    controllers/apiKey.controller.ts
    middlewares/apiKey.middleware.ts

Frontend:

    features/api-keys/ApiKeysPage.tsx

## Step 19: Build Public API

Endpoint:

    POST /api/v1/fraud-check

Headers:

    X-API-Key
    X-API-Secret

Use Redis rate limiting.

## Step 20: Build Super Admin

Backend:

    controllers/superAdmin.controller.ts
    routes/superAdmin.routes.ts

Frontend:

    pages/admin/SuperAdminWorkspacesPage.tsx
    pages/admin/SuperAdminStatsPage.tsx
