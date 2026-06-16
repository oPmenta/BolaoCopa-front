import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function RoleRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.tipo_usuario !== role) {
    return <Navigate to={user?.tipo_usuario === "ADMIN" ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
}
