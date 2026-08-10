# Coding Agent Prompt

You are building a production-ready multi-tenant SaaS called DispatchBD.

Use the documents inside the docs folder as the source of truth.

Your job is to build the project step by step using the Modern MERN stack.

## Primary Rules

1. Never leak data across workspaces.
2. Every tenant-sensitive database document must include workspaceId.
3. Every protected backend route must validate authentication and workspace membership.
4. Use TypeScript everywhere.
5. Use Zod for request validation.
6. Use clean folder structure.
7. Do not store secrets in frontend code.
8. Do not call courier or store APIs directly from frontend.
9. Use backend services for all external integrations.
10. Build incrementally and verify each phase before moving to the next.

## Build Order

1. Backend health check
2. MongoDB connection
3. User model
4. Auth register/login
5. Workspace model
6. WorkspaceMember model
7. Auth middleware
8. Workspace middleware
9. Frontend auth pages
10. App layout with sidebar
11. Store connection CRUD
12. Store order sync
13. Store orders table
14. Courier connection CRUD
15. Courier dispatch
16. Courier orders table
17. Fraud check
18. Analytics
19. Subscription plans
20. API keys
21. Public fraud API
22. Super admin panel

## Expected API Pattern

    /api/auth
    /api/workspaces
    /api/store-connections
    /api/store-orders
    /api/courier-connections
    /api/courier-orders
    /api/fraud-check
    /api/api-keys
    /api/analytics
    /api/billing
    /api/super-admin

## Database Pattern

Every protected collection should have:

    workspaceId: ObjectId

Example:

    StoreOrder {
      workspaceId
      storeConnectionId
      externalOrderId
      orderNumber
      customerName
      customerPhone
      totalAmount
      status
    }

## Frontend Pattern

Use feature-based folders:

    src/features/auth
    src/features/dashboard
    src/features/store
    src/features/courier
    src/features/fraud
    src/features/billing
    src/features/api-keys
    src/features/moderators

Use:

- TanStack Query for server data
- Zustand for global UI state
- React Hook Form plus Zod for forms
- Axios with credentials for API calls

## Definition of Done

A feature is complete only when:

- It is type-safe
- It validates input
- It enforces workspace access
- It has loading states
- It has empty states
- It has error states
- It is responsive
- It does not expose another workspace's data
