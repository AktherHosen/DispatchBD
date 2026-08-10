# Architecture

## High-Level Architecture

    React Frontend
          |
          | JSON API
          v
    Express API
          |
          | Mongoose
          v
    MongoDB Atlas
          |
          | External APIs
          v
    WooCommerce / Courier API / Telegram / Payment Gateway

## Multi-Tenant Strategy

Use logical multi-tenancy.

Every tenant document contains:

    workspaceId

This gives simple MongoDB data isolation when combined with middleware.

## Authentication Flow

1. User registers or logs in.
2. Server returns access token and refresh token.
3. Refresh token is stored in HTTP-only cookie.
4. Frontend sends access token in Authorization header.
5. Middleware validates user.
6. Workspace middleware validates membership.

## API Security

Protected API flow:

    request
      -> auth middleware
      -> workspace middleware
      -> role middleware
      -> controller
      -> service
      -> database

## External Integrations

All external API calls must happen on backend.

Never expose:

- WooCommerce consumer secret
- courier API secret
- Telegram bot token
- payment gateway secret

## Background Jobs

Use background jobs for:

- store order sync
- courier status sync
- analytics aggregation
- invite expiry cleanup
- failed payment recovery

Simple start:

- node-cron

Production scale:

- BullMQ
- Redis
- separate worker process
