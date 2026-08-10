# API Specification

## Auth

    POST /api/auth/register
    POST /api/auth/login
    POST /api/auth/refresh
    POST /api/auth/logout
    GET /api/auth/me

## Workspaces

    POST /api/workspaces
    GET /api/workspaces
    GET /api/workspaces/:id
    PATCH /api/workspaces/:id
    POST /api/workspaces/:id/switch

## Members

    POST /api/workspaces/:workspaceId/members/invite
    GET /api/workspaces/:workspaceId/members
    PATCH /api/workspaces/:workspaceId/members/:memberId
    DELETE /api/workspaces/:workspaceId/members/:memberId

## Store Connections

    POST /api/store-connections
    GET /api/store-connections
    GET /api/store-connections/:id
    PATCH /api/store-connections/:id
    DELETE /api/store-connections/:id
    POST /api/store-connections/:id/test
    POST /api/store-connections/:id/sync

## Store Orders

    GET /api/store-orders
    GET /api/store-orders/:id
    POST /api/store-orders/sync
    PATCH /api/store-orders/:id/status
    POST /api/store-orders/:id/send-to-courier
    POST /api/store-orders/:id/send-to-telegram
    POST /api/store-orders/:id/fraud-check

## Courier Connections

    POST /api/courier-connections
    GET /api/courier-connections
    GET /api/courier-connections/:id
    PATCH /api/courier-connections/:id
    DELETE /api/courier-connections/:id
    POST /api/courier-connections/:id/test

## Courier Orders

    GET /api/courier-orders
    POST /api/courier-orders
    GET /api/courier-orders/:id
    POST /api/courier-orders/:id/sync-status

## Fraud Check

    POST /api/fraud-check
    GET /api/fraud-check/stats
    GET /api/fraud-check/logs

## Public API

    POST /api/v1/fraud-check
    GET /api/v1/usage

Public API headers:

    X-API-Key
    X-API-Secret

## API Keys

    POST /api/api-keys
    GET /api/api-keys
    DELETE /api/api-keys/:id

## Analytics

    GET /api/analytics/dashboard
    GET /api/analytics/store-orders
    GET /api/analytics/courier-orders
    GET /api/analytics/sales

## Billing

    GET /api/billing/plans
    POST /api/billing/checkout
    POST /api/billing/webhook
    GET /api/billing/subscription

## Super Admin

    GET /api/super-admin/stats
    GET /api/super-admin/workspaces
    PATCH /api/super-admin/workspaces/:id/suspend
    PATCH /api/super-admin/workspaces/:id/plan
