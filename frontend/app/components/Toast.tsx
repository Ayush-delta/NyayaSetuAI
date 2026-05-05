"use client";

import React from "react";

export default function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 rounded-md bg-zinc-800 px-4 py-2 text-sm text-zinc-100">
      {message}
    </div>
  );
}
