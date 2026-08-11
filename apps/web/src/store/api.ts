import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { setCredentials, logout } from "./authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    const ws = (getState() as RootState).auth.workspace;
    const workspaceId = ws?.id || (ws as any)?._id;
    if (workspaceId) {
      headers.set("x-workspace-id", String(workspaceId));
    }
    return headers;
  }
});

const baseQueryWithReauth = async (args: string | { url: string; [key: string]: unknown }, api: Parameters<typeof baseQuery>[1], extraOptions: Record<string, unknown>) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error as { status: number }).status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string };
      api.dispatch(setCredentials({
        accessToken,
        user: (api.getState() as RootState).auth.user!,
        workspace: (api.getState() as RootState).auth.workspace!
      }));

      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout
      api.dispatch(logout());
    }
  }

  return result;
};

// Types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
  workspace: Workspace;
}

interface MeResponse {
  user: User;
  workspace: Workspace;
}

interface StoreConnection {
  _id: string;
  workspaceId: string;
  name: string;
  platform: string;
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  status: "active" | "inactive" | "error";
  lastSyncAt?: string;
  createdAt: string;
}

interface CourierConnection {
  _id: string;
  workspaceId: string;
  name: string;
  apiEndpoint: string;
  status: "active" | "inactive" | "error";
  createdAt: string;
}

interface CourierOrder {
  _id: string;
  workspaceId: string;
  courierConnectionId: { _id: string; name: string };
  storeOrderId: { _id: string; [key: string]: unknown };
  consignmentId: string;
  status: string;
  amount: number;
  statusHistory: Array<{ status: string; timestamp: string; note?: string }>;
  createdAt: string;
}

interface StoreOrder {
  _id: string;
  workspaceId: string;
  storeConnectionId: string;
  wooCommerceId: number;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  total: number;
  currency: string;
  note?: string;
  createdAt: string;
}

interface DashboardStats {
  stats: {
    totalOrders: number;
    activeCouriers: number;
    activeStores: number;
    totalRevenue: number;
    successRate: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  courierPerformance: {
    total: number;
    delivered: number;
    successRate: number;
    byStatus: Array<{ status: string; count: number; totalAmount: number }>;
  };
}

interface RtoStats {
  summary: {
    totalOrders: number;
    totalReturned: number;
    rtoRate: number;
    totalRtoCost: number;
    periodMonths: number;
  };
  monthly: Array<{
    year: number;
    month: number;
    label: string;
    total: number;
    returned: number;
    delivered: number;
    rtoRate: number;
  }>;
  byCourier: Array<{
    courierId: string;
    courierName: string;
    totalReturns: number;
    totalReturnCost: number;
    totalForwardCost: number;
    totalCost: number;
  }>;
  topReturners: Array<{
    phone: string;
    name: string;
    returnCount: number;
    totalValue: number;
  }>;
}

interface FraudCheckLog {
  _id: string;
  workspaceId: string;
  phone: string;
  riskLevel: "low" | "medium" | "high";
  totalOrders: number;
  successRate: number;
  checkedBy: { name: string; email: string };
  createdAt: string;
}

interface ApiKey {
  _id: string;
  workspaceId: string;
  name: string;
  key: string;
  lastUsedAt?: string;
  createdAt: string;
}

interface Plan {
  _id: string;
  name: string;
  tier: "free" | "pro" | "enterprise";
  price: number;
  limits: {
    stores: number;
    ordersPerMonth: number;
    fraudChecksPerMonth: number;
    moderators: number;
    apiAccess: boolean;
  };
}

interface NotificationSettings {
  telegram: {
    enabled: boolean;
    hasBotToken: boolean;
    hasChatId: boolean;
    chatId?: string;
    linkedAt?: string;
    notifyStatuses: string[];
  };
}

interface NotificationLog {
  _id: string;
  courierOrderId: { consignmentId: string; amount: number; status: string };
  channel: string;
  recipientType: string;
  recipient: string;
  status: "sent" | "failed";
  payload: string;
  error?: string;
  sentAt: string;
}

interface Subscription {
  _id: string;
  workspaceId: string;
  planId: Plan;
  status: "active" | "cancelled" | "expired";
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "moderator";
  joinedAt: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Workspace",
    "StoreConnection",
    "StoreOrder",
    "CourierConnection",
    "CourierOrder",
    "FraudCheck",
    "ApiKey",
    "Plan",
    "Subscription",
    "Member",
    "NotificationSettings"
  ],
  endpoints: (builder) => ({
    // Auth
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["User"]
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["User"]
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User"]
    }),
    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/change-password", method: "PUT", body })
    }),
    updateProfile: builder.mutation<{ user: User }, { name?: string; email?: string }>({
      query: (body) => ({ url: "/auth/profile", method: "PUT", body }),
      invalidatesTags: ["User"]
    }),
    requestPasswordReset: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body })
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body })
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"]
    }),
    getUserWorkspaces: builder.query<{ workspaces: Array<{ id: string; name: string; slug: string; role: string }> }, void>({
      query: () => "/auth/workspaces",
      providesTags: ["User"]
    }),

    // Store Connections
    getStoreConnections: builder.query<{ connections: StoreConnection[]; pagination: { page: number; limit: number; total: number; totalPages: number } }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: "/store-connections",
        params: Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""))
      }),
      providesTags: ["StoreConnection"]
    }),
    getStoreConnection: builder.query<{ connection: StoreConnection }, string>({
      query: (id) => `/store-connections/${id}`,
      providesTags: (_result, _error, id) => [{ type: "StoreConnection", id }]
    }),
    createStoreConnection: builder.mutation<{ connection: StoreConnection }, Partial<StoreConnection>>({
      query: (body) => ({ url: "/store-connections", method: "POST", body }),
      invalidatesTags: ["StoreConnection"]
    }),
    updateStoreConnection: builder.mutation<{ connection: StoreConnection }, { id: string; data: Partial<StoreConnection> }>({
      query: ({ id, data }) => ({ url: `/store-connections/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["StoreConnection"]
    }),
    deleteStoreConnection: builder.mutation<void, string>({
      query: (id) => ({ url: `/store-connections/${id}`, method: "DELETE" }),
      invalidatesTags: ["StoreConnection"]
    }),
    testStoreConnection: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/store-connections/${id}/test`, method: "POST" }),
      invalidatesTags: ["StoreConnection"]
    }),

    // Courier Connections
    getCourierConnections: builder.query<{ connections: CourierConnection[] }, void>({
      query: () => "/courier-connections",
      providesTags: ["CourierConnection"]
    }),
    getCourierConnection: builder.query<{ connection: CourierConnection }, string>({
      query: (id) => `/courier-connections/${id}`,
      providesTags: (_result, _error, id) => [{ type: "CourierConnection", id }]
    }),
    createCourierConnection: builder.mutation<{ connection: CourierConnection }, Partial<CourierConnection>>({
      query: (body) => ({ url: "/courier-connections", method: "POST", body }),
      invalidatesTags: ["CourierConnection"]
    }),
    updateCourierConnection: builder.mutation<{ connection: CourierConnection }, { id: string; data: Partial<CourierConnection> }>({
      query: ({ id, data }) => ({ url: `/courier-connections/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["CourierConnection"]
    }),
    deleteCourierConnection: builder.mutation<void, string>({
      query: (id) => ({ url: `/courier-connections/${id}`, method: "DELETE" }),
      invalidatesTags: ["CourierConnection"]
    }),
    testCourierConnection: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/courier-connections/${id}/test`, method: "POST" }),
      invalidatesTags: ["CourierConnection"]
    }),

    // Courier Orders
    getCourierOrders: builder.query<{ orders: CourierOrder[]; pagination: { page: number; limit: number; total: number; totalPages: number } }, { page?: number; limit?: number; status?: string; courierConnectionId?: string; search?: string }>({
      query: (params) => ({
        url: "/courier-orders",
        params: Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""))
      }),
      providesTags: ["CourierOrder"]
    }),
    getCourierOrder: builder.query<{ order: CourierOrder }, string>({
      query: (id) => `/courier-orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "CourierOrder", id }]
    }),
    createCourierOrder: builder.mutation<{ order: CourierOrder }, Partial<CourierOrder>>({
      query: (body) => ({ url: "/courier-orders", method: "POST", body }),
      invalidatesTags: ["CourierOrder"]
    }),
    updateCourierOrderStatus: builder.mutation<{ order: CourierOrder }, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/courier-orders/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["CourierOrder"]
    }),
    sendToCourier: builder.mutation<{ order: CourierOrder; consignmentId: string }, { storeOrderId: string; courierConnectionId: string; note?: string }>({
      query: (body) => ({ url: "/courier-orders/send", method: "POST", body }),
      invalidatesTags: ["CourierOrder", "StoreOrder"]
    }),
    bulkSendToCourier: builder.mutation<{ message: string; results: Array<{ orderId: string; success: boolean; consignmentId?: string; error?: string }> }, { orderIds: string[]; courierConnectionId: string }>({
      query: (body) => ({ url: "/courier-orders/bulk-send", method: "POST", body }),
      invalidatesTags: ["CourierOrder", "StoreOrder"]
    }),
    addOrderNote: builder.mutation<{ order: any }, { id: string; text: string }>({
      query: ({ id, text }) => ({ url: `/store-orders/${id}/notes`, method: "POST", body: { text } }),
      invalidatesTags: ["StoreOrder"]
    }),

    // Store Orders
    getStoreOrders: builder.query<{ orders: StoreOrder[]; pagination: { page: number; limit: number; total: number; totalPages: number } }, { page?: number; limit?: number; status?: string; storeConnectionId?: string; search?: string }>({
      query: (params) => ({
        url: "/store-orders",
        params: Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== ""))
      }),
      providesTags: ["StoreOrder"]
    }),
    updateStoreOrderStatus: builder.mutation<{ order: StoreOrder }, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/store-orders/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["StoreOrder"]
    }),
    syncStoreOrders: builder.mutation<{ message: string; synced: number }, string>({
      query: (storeConnectionId) => ({ url: `/store-orders/sync/${storeConnectionId}`, method: "POST" }),
      invalidatesTags: ["StoreOrder", "StoreConnection"]
    }),

    // Dashboard
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/dashboard/stats",
      providesTags: ["StoreOrder", "CourierOrder", "StoreConnection", "CourierConnection"]
    }),
    getRtoStats: builder.query<RtoStats, { months?: number }>({
      query: (params) => ({
        url: "/dashboard/rto",
        params: Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
      }),
      providesTags: ["StoreOrder", "CourierOrder"]
    }),

    // Fraud Check
    checkPhone: builder.mutation<{ phone: string; riskLevel: string; totalOrders: number; successRate: number; provider: string; internalRisk: string; internalScore: number }, { phone: string; courierConnectionId: string }>({
      query: (body) => ({ url: "/fraud/check", method: "POST", body }),
      invalidatesTags: ["FraudCheck"]
    }),
    getFraudChecks: builder.query<{ logs: FraudCheckLog[] }, { riskLevel?: string }>({
      query: (params) => ({
        url: "/fraud",
        params: Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
      }),
      providesTags: ["FraudCheck"]
    }),
    getFraudStats: builder.query<{ low: number; medium: number; high: number }, void>({
      query: () => "/fraud/stats",
      providesTags: ["FraudCheck"]
    }),
    scoreOrder: builder.mutation<{ orderId: string; riskLevel: string; riskScore: number; factors: { phoneReturnCount: number; zoneRtoRate: number; orderValueDeviation: number }; held: boolean }, { orderId: string; autoHold?: boolean }>({
      query: ({ orderId, autoHold }) => ({
        url: `/fraud/score/${orderId}${autoHold ? "?autoHold=true" : ""}`,
        method: "POST"
      }),
      invalidatesTags: ["StoreOrder"]
    }),
    bulkScoreOrders: builder.mutation<{ summary: { total: number; low: number; medium: number; high: number; held: number }; results: Array<{ orderId: string; orderNumber: string; riskLevel: string; riskScore: number; held: boolean }> }, { autoHold?: boolean }>({
      query: (body) => ({ url: "/fraud/bulk-score", method: "POST", body }),
      invalidatesTags: ["StoreOrder"]
    }),
    releaseHeldOrder: builder.mutation<{ message: string; orderId: string }, string>({
      query: (orderId) => ({ url: `/fraud/release/${orderId}`, method: "POST" }),
      invalidatesTags: ["StoreOrder"]
    }),
    getHeldOrders: builder.query<{ orders: Array<{
      _id: string;
      orderNumber: string;
      customerName: string;
      customerPhone: string;
      total: number;
      riskLevel: string;
      riskScore: number;
      heldAt: string;
      storeConnectionId: { name: string };
    }> }, void>({
      query: () => "/fraud/held",
      providesTags: ["StoreOrder"]
    }),

    // API Keys
    getApiKeys: builder.query<{ keys: ApiKey[] }, void>({
      query: () => "/api-keys",
      providesTags: ["ApiKey"]
    }),
    getApiKey: builder.query<{ key: ApiKey }, string>({
      query: (id) => `/api-keys/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ApiKey", id }]
    }),
    createApiKey: builder.mutation<{ key: ApiKey; secret: string }, { name: string }>({
      query: (body) => ({ url: "/api-keys", method: "POST", body }),
      invalidatesTags: ["ApiKey"]
    }),
    deleteApiKey: builder.mutation<void, string>({
      query: (id) => ({ url: `/api-keys/${id}`, method: "DELETE" }),
      invalidatesTags: ["ApiKey"]
    }),
    getApiKeyStats: builder.query<{ totalKeys: number; totalRequests: number }, void>({
      query: () => "/api-keys/stats",
      providesTags: ["ApiKey"]
    }),

    // Plans & Subscriptions
    getPlans: builder.query<{ plans: Plan[] }, void>({
      query: () => "/subscriptions/plans",
      providesTags: ["Plan"]
    }),
    getSubscription: builder.query<{ subscription: Subscription | null; plan?: Plan }, void>({
      query: () => "/subscriptions",
      providesTags: ["Subscription"]
    }),
    upgradePlan: builder.mutation<{ subscription: Subscription }, { planId: string }>({
      query: (body) => ({ url: "/subscriptions/upgrade", method: "POST", body }),
      invalidatesTags: ["Subscription", "Plan"]
    }),
    cancelSubscription: builder.mutation<void, void>({
      query: () => ({ url: "/subscriptions/cancel", method: "POST" }),
      invalidatesTags: ["Subscription"]
    }),

    // Members
    getMembers: builder.query<{ members: Member[] }, void>({
      query: () => "/members",
      providesTags: ["Member"]
    }),
    inviteMember: builder.mutation<{ member: Member }, { email: string; role?: string }>({
      query: (body) => ({ url: "/members", method: "POST", body }),
      invalidatesTags: ["Member"]
    }),
    updateMemberRole: builder.mutation<void, { id: string; role: string }>({
      query: ({ id, role }) => ({ url: `/members/${id}/role`, method: "PATCH", body: { role } }),
      invalidatesTags: ["Member"]
    }),
    removeMember: builder.mutation<void, string>({
      query: (id) => ({ url: `/members/${id}`, method: "DELETE" }),
      invalidatesTags: ["Member"]
    }),

    // Super Admin
    getSuperAdminStats: builder.query<{ stats: { totalWorkspaces: number; totalUsers: number; totalMembers: number } }, void>({
      query: () => "/admin/stats",
      providesTags: ["StoreConnection", "CourierConnection", "StoreOrder", "CourierOrder"]
    }),
    getAdminWorkspaces: builder.query<{ workspaces: Array<{ _id: string; name: string; slug: string; ownerId: { name: string; email: string }; createdAt: string }>; pagination: { page: number; limit: number; total: number; totalPages: number } }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: "/admin/workspaces",
        params: Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined))
      }),
      providesTags: ["Workspace"]
    }),
    suspendWorkspace: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/admin/workspaces/${id}/suspend`, method: "POST" }),
      invalidatesTags: ["Workspace"]
    }),
    reactivateWorkspace: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/admin/workspaces/${id}/reactivate`, method: "POST" }),
      invalidatesTags: ["Workspace"]
    }),

    // Notifications
    getNotificationSettings: builder.query<{ settings: NotificationSettings }, void>({
      query: () => "/notifications/settings",
      providesTags: ["NotificationSettings"]
    }),
    updateBotToken: builder.mutation<{ message: string }, { botToken: string }>({
      query: (body) => ({ url: "/notifications/bot-token", method: "PUT", body }),
      invalidatesTags: ["NotificationSettings"]
    }),
    getLinkingCode: builder.mutation<{ code: string; instructions: string }, void>({
      query: () => ({ url: "/notifications/linking-code", method: "POST" }),
      invalidatesTags: ["NotificationSettings"]
    }),
    toggleTelegram: builder.mutation<{ message: string }, { enabled: boolean }>({
      query: (body) => ({ url: "/notifications/toggle", method: "POST", body }),
      invalidatesTags: ["NotificationSettings"]
    }),
    updateNotifyStatuses: builder.mutation<{ message: string; notifyStatuses: string[] }, { notifyStatuses: string[] }>({
      query: (body) => ({ url: "/notifications/statuses", method: "PUT", body }),
      invalidatesTags: ["NotificationSettings"]
    }),
    unlinkTelegram: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/notifications/unlink", method: "POST" }),
      invalidatesTags: ["NotificationSettings"]
    }),
    getNotificationLogs: builder.query<{ logs: NotificationLog[] }, void>({
      query: () => "/notifications/logs",
      providesTags: ["NotificationSettings"]
    })
  })
});

export const {
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useGetUserWorkspacesQuery,

  // Store Connections
  useGetStoreConnectionsQuery,
  useGetStoreConnectionQuery,
  useCreateStoreConnectionMutation,
  useUpdateStoreConnectionMutation,
  useDeleteStoreConnectionMutation,
  useTestStoreConnectionMutation,

  // Courier Connections
  useGetCourierConnectionsQuery,
  useGetCourierConnectionQuery,
  useCreateCourierConnectionMutation,
  useUpdateCourierConnectionMutation,
  useDeleteCourierConnectionMutation,
  useTestCourierConnectionMutation,

  // Courier Orders
  useGetCourierOrdersQuery,
  useGetCourierOrderQuery,
  useCreateCourierOrderMutation,
  useUpdateCourierOrderStatusMutation,
  useSendToCourierMutation,
  useBulkSendToCourierMutation,
  useAddOrderNoteMutation,

  // Store Orders
  useGetStoreOrdersQuery,
  useUpdateStoreOrderStatusMutation,
  useSyncStoreOrdersMutation,

  // Dashboard
  useGetDashboardStatsQuery,
  useGetRtoStatsQuery,

  // Fraud Check
  useCheckPhoneMutation,
  useGetFraudChecksQuery,
  useGetFraudStatsQuery,
  useScoreOrderMutation,
  useBulkScoreOrdersMutation,
  useReleaseHeldOrderMutation,
  useGetHeldOrdersQuery,

  // API Keys
  useGetApiKeysQuery,
  useGetApiKeyQuery,
  useCreateApiKeyMutation,
  useDeleteApiKeyMutation,
  useGetApiKeyStatsQuery,

  // Plans & Subscriptions
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useUpgradePlanMutation,
  useCancelSubscriptionMutation,

  // Members
  useGetMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,

  // Super Admin
  useGetSuperAdminStatsQuery,
  useGetAdminWorkspacesQuery,
  useSuspendWorkspaceMutation,
  useReactivateWorkspaceMutation,

  // Notifications
  useGetNotificationSettingsQuery,
  useUpdateBotTokenMutation,
  useGetLinkingCodeMutation,
  useToggleTelegramMutation,
  useUpdateNotifyStatusesMutation,
  useUnlinkTelegramMutation,
  useGetNotificationLogsQuery
} = api;
