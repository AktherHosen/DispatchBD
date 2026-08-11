import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken || !isAuthenticated) {
      navigate("/login");
    }
  }, [accessToken, isAuthenticated, navigate]);

  if (!accessToken || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
