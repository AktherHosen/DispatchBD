import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import AppLayout from "@/components/layout/AppLayout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TODO: check auth status
  const isAuthenticated = true;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  // TODO: check auth status
  const isAuthenticated = true;
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

        {/* Placeholder routes */}
        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <div className="text-2xl font-bold">Stores - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/couriers"
          element={
            <ProtectedRoute>
              <div className="text-2xl font-bold">Couriers - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fraud"
          element={
            <ProtectedRoute>
              <div className="text-2xl font-bold">Fraud Check - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderators"
          element={
            <ProtectedRoute>
              <div className="text-2xl font-bold">Moderators - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-keys"
          element={
            <ProtectedRoute>
              <div className="text-2xl font-bold">API Keys - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <div className="text-2xl font-bold">Plans - Coming Soon</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div className="text-2xl font-bold">Settings - Coming Soon</div>
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
