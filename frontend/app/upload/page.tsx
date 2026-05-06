"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, File, X, CheckCircle2, Loader2 } from "lucide-react";
import ProtectedWrapper from "../components/ProtectedWrapper";
import { documentService } from "../services/documentService";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    // Simulate upload progress while we wait for backend
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 1000);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Upload failed");
      }

      const responseData = await response.json();
      
      clearInterval(interval);
      setProgress(100);

      // Save the real backend response to localStorage so the edit page can use it
      documentService.saveDocument(responseData);

      setTimeout(() => {
        router.push(`/edit/${responseData.record_id}`);
      }, 500);

    } catch (error: any) {
      clearInterval(interval);
      setIsUploading(false);
      setProgress(0);
      alert(`Error uploading document: ${error.message}`);
    }
  };

  return (
    <ProtectedWrapper adminOnly={true}>
      <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Upload Legal Document
            </h1>
            <p className="mt-4 text-slate-600">
              Upload a PDF judgment, contract, or petition for AI analysis and data extraction.
            </p>
          </div>

          <div
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"
          >
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div className="mb-4 rounded-full bg-blue-50 border border-blue-100 p-4 shadow-sm">
                  <UploadCloud className="text-blue-600" size={32} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Click or drag and drop to upload
                </h3>
                <p className="text-sm text-slate-500">PDF files up to 50MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                  <File className="text-blue-600" size={40} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{file.name}</h3>
                <p className="mb-8 text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                {isUploading ? (
                  <div className="w-full max-w-md">
                    <div className="mb-2 flex items-center justify-between text-sm font-medium">
                      <span className="flex items-center gap-2 text-blue-700">
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing document...
                      </span>
                      <span className="text-slate-600">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFile(null)}
                      className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      className="flex items-center gap-2 rounded-full bg-blue-700 px-8 py-2.5 text-sm font-bold text-white transition-transform hover:bg-blue-800 shadow-md"
                    >
                      <CheckCircle2 size={18} />
                      Process Document
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedWrapper>
  );
}
