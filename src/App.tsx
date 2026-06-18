import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { Layout } from "@/components/Layout";
import { ProtectedRoute, RoleRoute } from "@/components/Guards";

import Login from "@/pages/Login";
import Cadastro from "@/pages/Cadastro";

import Home from "@/pages/user/Home";
import CampanhaDetalhe from "@/pages/user/CampanhaDetalhe";
import MinhasCampanhas from "@/pages/user/MinhasCampanhas";
import CriarCampanha from "@/pages/user/CriarCampanha";
import GerenciarCampanha from "@/pages/user/GerenciarCampanha";

import AdminDashboard from "@/pages/admin/Dashboard";
import CriarCampanhaAdmin from "@/pages/admin/CriarCampanhaAdmin";
import MeiosPagamento from "@/pages/admin/MeiosPagamento";

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.tipo_usuario === "ADMIN" ? "/admin" : "/home"} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* USER */}
              <Route
                path="/"
                element={
                  <RoleRoute role="USER">
                    <Home />
                  </RoleRoute>
                }
              />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/campanhas/codigo/:codigo" element={<CampanhaDetalhe />} />
              <Route path="/campanhas/:codigo/gerenciar" element={<GerenciarCampanha />} />
              <Route path="/minhas-campanhas" element={<MinhasCampanhas />} />
              <Route
                path="/campanhas/nova"
                element={
                  <RoleRoute role="USER">
                    <CriarCampanha />
                  </RoleRoute>
                }
              />

              {/* ADMIN */}
              <Route
                path="/admin"
                element={
                  <RoleRoute role="ADMIN">
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/campanhas/nova"
                element={
                  <RoleRoute role="ADMIN">
                    <CriarCampanhaAdmin />
                  </RoleRoute>
                }
              />
            </Route>

            <Route path="/__root" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
