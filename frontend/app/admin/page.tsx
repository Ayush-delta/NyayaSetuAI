"use client";

import React from "react";
import ProtectedWrapper from "../components/ProtectedWrapper";

export default function AdminPage() {
  return (
    <ProtectedWrapper>
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-2 text-zinc-400">Admin-only controls (protected).</p>
      </div>
    </ProtectedWrapper>
  );
}
