"use client";

import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="mx-auto my-12 w-full max-w-3xl px-6">
        <div className="flex items-center justify-center">
          <div className="glass w-full rounded-2xl p-8">
            <h1 className="mb-4 text-3xl font-semibold">Welcome back</h1>
            <p className="mb-6 text-zinc-400">Sign in to continue to NyayaSetuAI</p>
            <AuthForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              submitLabel="Sign in"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
