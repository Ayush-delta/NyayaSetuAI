import axios from "axios";

const BASE = "http://127.0.0.1:8000/api/auth";

export interface AuthUser {
  username: string;
  role: "admin" | "officer";
  full_name: string;
  access_token: string;
}

export const login = async (
  username: string,
  password: string
): Promise<AuthUser> => {
  const res = await axios.post(`${BASE}/login`, { username, password });
  const data = res.data;
  // Store in localStorage
  localStorage.setItem("nyayasetu_token", data.access_token);
  localStorage.setItem("nyayasetu_user", JSON.stringify(data));
  return data;
};

export const logout = () => {
  localStorage.removeItem("nyayasetu_token");
  localStorage.removeItem("nyayasetu_user");
  window.location.href = "/login";
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nyayasetu_token");
};

export const getUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("nyayasetu_user");
  return user ? JSON.parse(user) : null;
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "admin";
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};