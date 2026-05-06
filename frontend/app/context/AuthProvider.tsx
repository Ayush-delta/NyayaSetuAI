"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiLogin,
  setToken,
  clearToken,
  getToken,
  setUser as storeUser,
  getUser as storedUser,
  apiSignup,
  AuthUser,
} from "../services/auth";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const t = getToken();
      const u = storedUser();
      if (t && u) {
        setTokenState(t);
        setUser(u);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      const res = await apiLogin(username, password);
      if (res?.token) {
        setToken(res.token);
        setTokenState(res.token);
        storeUser(res.user);
        setUser(res.user);

        // Route based on role
        if (res.user.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
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
        storeUser(res.user);
        setUser(res.user);
        router.push("/dashboard");
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

  function isAdmin(): boolean {
    return user?.role === "admin";
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
