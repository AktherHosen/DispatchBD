import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AppLayout from "@/components/layout/AppLayout";
import StoreConnectionsPage from "@/features/store/StoreConnectionsPage";
import StoreConnectionCreatePage from "@/features/store/StoreConnectionCreatePage";
import StoreOrdersPage from "@/features/store/StoreOrdersPage";
import CourierConnectionsPage from "@/features/courier/CourierConnectionsPage";
import CourierOrdersPage from "@/features/courier/CourierOrdersPage";
import ModeratorsPage from "@/features/team/ModeratorsPage";
import FraudCheckPage from "@/features/fraud/FraudCheckPage";
import PlansPage from "@/features/billing/PlansPage";
import ApiKeysPage from "@/features/api-keys/ApiKeysPage";
import SettingsPage from "@/features/settings/SettingsPage";
import SuperAdminPage from "@/pages/admin/SuperAdminPage";

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
    </BrowserRouter>
  );
}
