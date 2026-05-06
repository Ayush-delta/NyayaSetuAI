"use client";

// Real auth service — connects to FastAPI backend /api/auth/login

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const BASE = `${API_URL}/api/auth`;

export type AuthUser = {
  username: string;
  role: "admin" | "officer";
  full_name: string;
  access_token: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function apiLogin(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid username or password");
  }

  const data = await res.json();

  // Build a consistent response
  return {
    token: data.access_token,
    user: {
      username: data.username,
      role: data.role,
      full_name: data.full_name,
      access_token: data.access_token,
    },
  };
}

export async function apiSignup(
  email: string,
  password: string
): Promise<LoginResponse> {
  const username = email;
  const full_name = email.split("@")[0];

  const res = await fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, full_name }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create account");
  }

  const data = await res.json();
  return {
    token: data.access_token,
    user: {
      username: data.username,
      role: data.role,
      full_name: data.full_name,
      access_token: data.access_token,
    },
  };
}

export function setToken(token: string) {
  try {
    localStorage.setItem("nyaya_token", token);
    document.cookie = `nyaya_token=${token}; path=/`;
  } catch (e) {
    // noop
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("nyaya_token");
    localStorage.removeItem("nyaya_user");
    document.cookie = `nyaya_token=; Max-Age=0; path=/`;
  } catch (e) {}
}

export function getToken() {
  try {
    return localStorage.getItem("nyaya_token");
  } catch (e) {
    return null;
  }
}

export function setUser(user: AuthUser) {
  try {
    localStorage.setItem("nyaya_user", JSON.stringify(user));
  } catch (e) {}
}

export function getUser(): AuthUser | null {
  try {
    const u = localStorage.getItem("nyaya_user");
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
}
