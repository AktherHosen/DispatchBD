import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const StoreConnectionsPage = lazy(() => import("@/features/store/StoreConnectionsPage"));
const StoreConnectionCreatePage = lazy(() => import("@/features/store/StoreConnectionCreatePage"));
const StoreOrdersPage = lazy(() => import("@/features/store/StoreOrdersPage"));
const CourierConnectionsPage = lazy(() => import("@/features/courier/CourierConnectionsPage"));
const CourierOrdersPage = lazy(() => import("@/features/courier/CourierOrdersPage"));
const ModeratorsPage = lazy(() => import("@/features/team/ModeratorsPage"));
const FraudCheckPage = lazy(() => import("@/features/fraud/FraudCheckPage"));
const PlansPage = lazy(() => import("@/features/billing/PlansPage"));
const ApiKeysPage = lazy(() => import("@/features/api-keys/ApiKeysPage"));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));
const OrderDetailPage = lazy(() => import("@/features/orders/OrderDetailPage"));
const SuperAdminPage = lazy(() => import("@/pages/admin/SuperAdminPage"));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Guest routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Store routes */}
          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <StoreConnectionsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <StoreConnectionCreatePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/orders"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <StoreOrdersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <OrderDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Courier routes */}
          <Route
            path="/couriers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CourierConnectionsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/couriers/orders"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CourierOrdersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fraud check */}
          <Route
            path="/fraud"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <FraudCheckPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Moderators */}
          <Route
            path="/moderators"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ModeratorsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* API Keys */}
          <Route
            path="/api-keys"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ApiKeysPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Plans */}
          <Route
            path="/plans"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PlansPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Super Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SuperAdminPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
