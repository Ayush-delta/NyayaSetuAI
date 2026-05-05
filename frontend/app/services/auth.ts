"use client";

// Frontend-only mock mode: this file provides mock login/signup flows
// so the UI can run without a backend. Token is stored in localStorage
// and mirrored to a cookie for middleware routing.

export type LoginResponse = {
  token: string;
  user?: { email?: string };
};

function makeMockToken(email: string) {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ email, iat: Date.now() }));
  return `${header}.${payload}.mock`;
}

export async function apiLogin(email: string, password: string) {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  const token = makeMockToken(email);
  return { token, user: { email } } as LoginResponse;
}

export async function apiSignup(email: string, password: string) {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 600));
  const token = makeMockToken(email);
  return { token, user: { email } } as LoginResponse;
}

export function setToken(token: string) {
  try {
    localStorage.setItem("nyaya_token", token);
    // mirror to cookie so middleware can use it when running locally
    document.cookie = `nyaya_token=${token}; path=/`;
  } catch (e) {
    // noop
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("nyaya_token");
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
