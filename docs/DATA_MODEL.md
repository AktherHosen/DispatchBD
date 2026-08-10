# Data Model

## User

    User {
      name
      email
      passwordHash
      isActive
      createdAt
      updatedAt
    }

## Workspace

    Workspace {
      name
      slug
      owner
      plan
      onboardingCompleted
      settings
      createdAt
      updatedAt
    }

## WorkspaceMember

    WorkspaceMember {
      workspaceId
      userId
      role
      status
      invitedBy
      joinedAt
    }

Roles:

    OWNER
    ADMIN
    MODERATOR

Status:

    ACTIVE
    INVITED
    DISABLED

## StoreConnection

    StoreConnection {
      workspaceId
      name
      platform
      storeUrl
      consumerKey
      consumerSecret
      webhookSecret
      status
      lastSyncedAt
      meta
    }

## StoreOrder

    StoreOrder {
      workspaceId
      storeConnectionId
      externalOrderId
      orderNumber
      customerName
      customerPhone
      customerEmail
      address
      totalAmount
      currency
      paymentStatus
      fulfillmentStatus
      status
      source
      items
      rawPayload
      syncedAt
    }

Indexes:

    workspaceId + createdAt
    workspaceId + customerPhone
    workspaceId + storeConnectionId + externalOrderId unique

## CourierConnection

    CourierConnection {
      workspaceId
      name
      provider
      apiKey
      apiSecret
      baseUrl
      status
      meta
    }

## CourierOrder

    CourierOrder {
      workspaceId
      courierConnectionId
      storeOrderId
      consignmentId
      customerName
      customerPhone
      address
      amount
      status
      trackingUrl
      rawPayload
      sentAt
      updatedAt
    }

## FraudCheckLog

    FraudCheckLog {
      workspaceId
      phoneNumber
      totalChecks
      successCount
      failCount
      lastCheckedAt
      source
    }

## ApiKey

    ApiKey {
      workspaceId
      name
      key
      secretHash
      isActive
      lastUsedAt
      createdAt
    }

Important:

- Store only hashed secret.
- Show secret only once during creation.

## Subscription

    Subscription {
      workspaceId
      plan
      status
      currentPeriodStart
      currentPeriodEnd
      paymentProvider
      externalSubscriptionId
    }
