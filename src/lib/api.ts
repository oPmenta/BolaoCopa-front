import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/", 
});

const TOKEN_KEY = "bolao_token";
const USER_KEY = "bolao_user";

console.log(localStorage.getItem('bolao_token'));

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setStoredUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export function apiErrorMessage(err: unknown, fallback = "Algo deu errado") {
  const e = err as { response?: { data?: { mensagem?: string; message?: string; error?: string } }; message?: string };
  return (
    e?.response?.data?.mensagem ||
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    fallback
  );
}
