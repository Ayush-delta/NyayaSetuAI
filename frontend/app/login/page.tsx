"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { Scale, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  async function handleLogin() {
    if (!username || !password) {
      setError("Please enter credentials");
      return;
    }
    setError(null);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md">
            <Scale size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            NyayaSetu<span className="text-blue-600">AI</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Karnataka Government — Court Judgment System
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter username"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        {/* Role info */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="mb-3 text-center text-xs text-slate-400">
            Access levels
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-amber-50 p-3 text-center border border-amber-100">
              <p className="text-xs font-semibold text-amber-800">Admin</p>
              <p className="mt-1 text-[10px] text-amber-600">
                Upload, Review, Verify, Dashboard
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center border border-blue-100">
              <p className="text-xs font-semibold text-blue-800">Officer</p>
              <p className="mt-1 text-[10px] text-blue-600">
                Dashboard view only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
