import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AppLayout from "@/components/layout/AppLayout";
import StoreConnectionsPage from "@/features/store/StoreConnectionsPage";
import StoreConnectionCreatePage from "@/features/store/StoreConnectionCreatePage";
import StoreOrdersPage from "@/features/store/StoreOrdersPage";
import CourierConnectionsPage from "@/features/courier/CourierConnectionsPage";
import CourierOrdersPage from "@/features/courier/CourierOrdersPage";
import FraudCheckPage from "@/features/fraud/FraudCheckPage";
import PlansPage from "@/features/billing/PlansPage";
import ApiKeysPage from "@/features/api-keys/ApiKeysPage";
import SettingsPage from "@/features/settings/SettingsPage";
import SuperAdminPage from "@/pages/admin/SuperAdminPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true; // TODO: check auth status
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true; // TODO: check auth status
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
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Store routes */}
        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <StoreConnectionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores/new"
          element={
            <ProtectedRoute>
              <StoreConnectionCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores/orders"
          element={
            <ProtectedRoute>
              <StoreOrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Courier routes */}
        <Route
          path="/couriers"
          element={
            <ProtectedRoute>
              <CourierConnectionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/couriers/orders"
          element={
            <ProtectedRoute>
              <CourierOrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Fraud check */}
        <Route
          path="/fraud"
          element={
            <ProtectedRoute>
              <FraudCheckPage />
            </ProtectedRoute>
          }
        />

        {/* Moderators */}
        <Route
          path="/moderators"
          element={
            <ProtectedRoute>
              <div className="text-2xl font-bold">Moderators - Coming Soon</div>
            </ProtectedRoute>
          }
        />

        {/* API Keys */}
        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              <ApiKeysPage />
            </ProtectedRoute>
          }
        />

        {/* Plans */}
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <PlansPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Super Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <SuperAdminPage />
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
