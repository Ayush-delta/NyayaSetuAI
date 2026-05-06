"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedWrapper({
  children,
  adminOnly = false,
}: Props) {
  const { token, user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (adminOnly && !isAdmin()) {
      router.replace("/dashboard");
      return;
    }

    setChecking(false);
  }, [loading, token, adminOnly, router, user, isAdmin]);

  if (loading || checking) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm">Checking access...</div>
      </div>
    );
  }

  return <>{children}</>;
}
