"use client";

import React from "react";

type Props = {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
};

export default function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading,
  error,
  submitLabel = "Continue",
}: Props) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
      <div className="glass rounded-xl p-6">
        <h2 className="mb-4 text-2xl font-semibold">{submitLabel}</h2>

        <label className="block text-sm">
          <span className="text-zinc-300">Email</span>
          <input
            className="mt-1 w-full rounded-md bg-zinc-900 px-3 py-2 text-zinc-100 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="text-zinc-300">Password</span>
          <input
            className="mt-1 w-full rounded-md bg-zinc-900 px-3 py-2 text-zinc-100 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
          />
        </label>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Loading..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
