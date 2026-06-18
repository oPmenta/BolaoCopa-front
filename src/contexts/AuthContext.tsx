import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  api,
  apiErrorMessage,
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken as persistToken,
} from "@/lib/api";
import type { LoginResponse, Usuario } from "@/types";

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  cadastro: (data: { nome: string; email: string; senha: string; cpf: string; telefone: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => getStoredUser<Usuario>());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const onStorage = () => {
      setTokenState(getToken());
      setUser(getStoredUser<Usuario>());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    try {
      const response = await api.post<{
        success: boolean;
        data: { token: string; usuario: Usuario };
      }>("/login", { email, senha });

      const payload = response.data.data;
      persistToken(payload.token);
      setStoredUser(payload.usuario);
      setTokenState(payload.token);
      setUser(payload.usuario);

      queryClient.invalidateQueries({ queryKey: ["campanhas"] });

      return payload.usuario;
    } catch (e) {
      throw new Error(apiErrorMessage(e, "Falha no login"));
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  const cadastro = useCallback(
    async (data: { nome: string; email: string; senha: string; cpf: string; telefone: string }) => {
      setLoading(true);
      try {
        await api.post("/cadastro", data);
      } catch (e) {
        throw new Error(apiErrorMessage(e, "Falha no cadastro"));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.tipo_usuario === "ADMIN",
      loading,
      login,
      cadastro,
      logout,
    }),
    [user, token, loading, login, cadastro, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de <AuthProvider>");
  return ctx;
}