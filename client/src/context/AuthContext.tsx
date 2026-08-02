import { useState } from "react";
import type { ReactNode } from "react";
import api from "../lib/api";
import { AuthContext } from "./auth-context";
import type { User, RegisterPayload } from "../types/useAuth";

function readStoredUser(): User | null {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. Read from localStorage synchronously during initialization
  const [user, setUser] = useState<User | null>(readStoredUser);

  // 2. Keep a static value for the context interface without using state
  const loading = false;

  const persistSession = (data: User & { token: string }) => {
    const { token, ...userData } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data);
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post("/auth/register", payload);
    persistSession(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}