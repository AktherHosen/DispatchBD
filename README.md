# DispatchBD

DispatchBD is a multi-tenant courier and store management platform.

Businesses can:

- Connect stores
- Sync store orders
- Connect courier providers
- Send orders to couriers
- Track courier orders
- Check fraud risk by phone number
- Invite moderators
- View analytics
- Manage API keys
- Subscribe to paid plans

## Tech Stack

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Router
- Axios
- Recharts

Backend:

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT auth
- Zod validation
- Redis for rate limiting

External integrations:

- WooCommerce
- Courier API, example: Steadfast
- Telegram Bot API
- Stripe or SSLCommerz/AamarPay

## Core Modules

1. Auth and workspace management
2. Store connections
3. Store orders
4. Courier connections
5. Courier orders
6. Fraud check
7. Analytics
8. API keys and public API
9. Subscription and billing
10. Moderator management
11. Super admin panel

## Monorepo Structure

    apps/
      api/
      web/
    docs/
    package.json
    pnpm-workspace.yaml

## Important SaaS Rule

Every tenant-sensitive document must contain:

    workspaceId

Examples:

- StoreConnection
- StoreOrder
- CourierConnection
- CourierOrder
- FraudCheckLog
- ApiKey
- Subscription

Every protected API must validate:

1. User is authenticated.
2. User belongs to the requested workspace.
3. User has permission for the action.

## Local Setup

Install dependencies:

    pnpm install

Start MongoDB and Redis:

    docker compose up -d

Run API:

    pnpm --filter api dev

Run web:

    pnpm --filter web dev

API health check:

    http://localhost:5000/health

Web app:

    http://localhost:5173

## Environment Variables

Copy API env:

    cp apps/api/.env.example apps/api/.env

Copy web env:

    cp apps/web/.env.example apps/web/.env

## Build Order

1. Auth
2. Workspace and membership
3. Dashboard layout
4. Store connection
5. Store order sync
6. Courier connection
7. Courier dispatch
8. Fraud check
9. Analytics
10. Billing
11. API keys
12. Super admin
