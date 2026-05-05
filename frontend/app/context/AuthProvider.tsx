"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin, apiSignup, setToken, clearToken, getToken } from "../services/auth";

type User = { email?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const t = getToken();
      if (t) {
        setTokenState(t);
        // try to decode basic email from token payload if present (naive)
        try {
          const parts = t.split(".");
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1]));
            setUser({ email: payload.email });
          }
        } catch (e) {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res?.token) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user ?? { email });
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }

  async function signup(email: string, password: string) {
    setLoading(true);
    try {
      const res = await apiSignup(email, password);
      if (res?.token) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user ?? { email });
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setTokenState(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
