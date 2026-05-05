"use client";

import React from "react";
import ProtectedWrapper from "../components/ProtectedWrapper";

export default function QueryPage() {
  return (
    <ProtectedWrapper>
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Query</h1>
        <p className="mt-2 text-zinc-400">Chat with the AI about your documents.</p>
      </div>
    </ProtectedWrapper>
  );
}
