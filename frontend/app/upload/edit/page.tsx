"use client";

import React, { useState } from "react";
import ProtectedWrapper from "../../components/ProtectedWrapper";
import { uploadFile } from "../../services/api";
import { saveTextDocument } from "../../services/api";
import { useRouter } from "next/navigation";
import Loader from "../../components/Loader";

export default function EditUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpload() {
    if (!file) return setError("Please choose a PDF file first.");
    setError(null);
    setLoading(true);
    try {
      const res = await uploadFile(file);
      // Expect backend to return extracted text in `text` or `content`
      const extracted = res?.text ?? res?.content ?? "";
      setFilename(res?.filename ?? file.name);
      setTitle((prev) => prev || (res?.filename ?? file.name));
      setContent(extracted || "");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError(null);
    setLoading(true);
    try {
      await saveTextDocument(title || filename, filename, content);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedWrapper>
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Edit PDF before adding</h1>

        <div className="mt-6 grid gap-4">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={handleUpload}
              className="rounded-md bg-emerald-600 px-3 py-1 text-sm hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? <Loader size={16} /> : "Upload & Extract"}
            </button>
          </div>

          <label className="block w-full max-w-3xl">
            <div className="text-sm text-zinc-400">Title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md bg-zinc-900 px-3 py-2 text-zinc-100 outline-none"
              placeholder="Document title"
            />
          </label>

          <label className="block w-full max-w-3xl">
            <div className="text-sm text-zinc-400">Filename</div>
            <input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="mt-1 w-full rounded-md bg-zinc-900 px-3 py-2 text-zinc-100 outline-none"
              placeholder="filename.pdf"
            />
          </label>

          <div className="w-full max-w-4xl">
            <div className="mb-2 text-sm text-zinc-400">Extracted text (editable)</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="w-full rounded-md bg-zinc-900 p-4 text-sm text-zinc-100 outline-none"
            />
          </div>

          {error ? <div className="text-sm text-red-400">{error}</div> : null}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save to Dashboard"}
            </button>
            <button
              onClick={() => {
                setContent("");
                setTitle("");
                setFilename("");
                setFile(null);
              }}
              className="rounded-md bg-zinc-700 px-4 py-2 hover:bg-zinc-600"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </ProtectedWrapper>
  );
}
