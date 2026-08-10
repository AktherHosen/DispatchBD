# Product Specification

DispatchBD is a B2B SaaS platform for managing stores, orders, couriers, fraud checking, analytics, and subscriptions.

## Target User

E-commerce businesses in Bangladesh that use:

- WooCommerce stores
- Courier providers such as Steadfast
- Manual phone verification
- Telegram notifications
- Moderator teams

## Main User Roles

### Owner

Full access to workspace, billing, members, API keys, and settings.

### Admin

Manage stores, couriers, orders, fraud checks, moderators, and analytics.

### Moderator

Limited access to orders, fraud checks, and assigned operational tasks.

## Functional Modules

### 1. Authentication

Users can register and login.

Required fields:

- name
- email
- password

Auth features:

- JWT access token
- refresh token
- logout
- current user

### 2. Workspace

Each business has its own workspace.

Workspace contains:

- stores
- courier connections
- orders
- fraud logs
- API keys
- members
- subscription

### 3. Store Module

Store features:

- connect WooCommerce store
- test connection
- sync orders
- view orders
- update order status
- send order to courier
- send Telegram notification
- fraud check customer phone

### 4. Courier Module

Courier features:

- connect courier provider
- test connection
- send order to courier
- track consignment ID
- sync courier status
- view courier orders

### 5. Fraud Check

Fraud check features:

- check phone number
- calculate success rate
- show risk level
- store check history
- public API for external use
- API key authentication
- rate limiting

### 6. Analytics

Analytics features:

- total orders
- total sales
- average order value
- orders by status
- orders by courier
- order source
- daily sales
- monthly sales
- custom date range

### 7. Subscription

Plans:

- Free
- Pro
- Enterprise

Possible limits:

- number of stores
- orders per month
- fraud checks per month
- number of moderators
- API access

### 8. Super Admin

Platform owner can:

- view all workspaces
- manage subscriptions
- suspend workspaces
- monitor usage
- support customers
