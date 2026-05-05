"use client";

import React, { useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  if (loading || !token) return <div className="p-8">Loading...</div>;

  return <>{children}</>;
}
