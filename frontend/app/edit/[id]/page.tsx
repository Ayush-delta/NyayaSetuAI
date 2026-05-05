"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ShieldCheck, ShieldAlert, Save, XCircle } from "lucide-react";
import ProtectedWrapper from "../../components/ProtectedWrapper";
import { documentService, ProcessedDocument } from "../../services/documentService";

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [document, setDocument] = useState<ProcessedDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("case"); // 'case', 'action', 'raw'

  useEffect(() => {
    if (id) {
      const doc = documentService.getDocumentById(id);
      if (doc) {
        setDocument(doc);
      } else {
        alert("Document not found.");
        router.push("/dashboard");
      }
    }
  }, [id, router]);

  const handleAction = (action: "approved" | "rejected" | "pending") => {
    if (!document) return;
    setIsProcessing(true);

    const updatedDoc = {
      ...document,
      data: {
        ...document.data,
        verification_status: action,
      }
    };

    // Simulate network delay
    setTimeout(() => {
      documentService.saveDocument(updatedDoc);
      setIsProcessing(false);
      router.push("/dashboard");
    }, 1000);
  };

  const handleNestedChange = (path: string[], value: any) => {
    if (!document) return;
    
    setDocument((prev) => {
      if (!prev) return prev;
      const newDoc = { ...prev };
      let current: any = newDoc;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      
      return newDoc;
    });
  };

  if (!document) {
    return (
      <ProtectedWrapper>
        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </ProtectedWrapper>
    );
  }

  const { data } = document;
  const { case_details } = data.extracted_data;
  const { action_plan, confidence_scores } = data;

  const getConfidenceBadge = (scoreKey: string) => {
    const score = confidence_scores[scoreKey] ?? 1;
    const percentage = Math.round(score * 100);
    
    let colorClass = "bg-emerald-100 text-emerald-700";
    if (percentage < 80) colorClass = "bg-yellow-100 text-yellow-700";
    if (percentage < 60) colorClass = "bg-red-100 text-red-700";

    return (
      <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${colorClass}`} title="AI Confidence Score">
        {percentage}% Confidence
      </span>
    );
  };

  return (
    <ProtectedWrapper>
      <div className="min-h-[calc(100vh-73px)] bg-slate-50">
        <div className="mx-auto max-w-5xl p-6 sm:p-12">
          <div className="mb-8 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <button
                onClick={() => router.push("/dashboard")}
                className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700"
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Human-in-the-Loop Verification
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Review and verify the AI-extracted intelligence for: <span className="font-semibold text-slate-800">{data.filename}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleAction("rejected")}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject
              </button>
              <button
                onClick={() => handleAction("pending")}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <Save size={18} />
                Save Draft
              </button>
              <button
                onClick={() => handleAction("approved")}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-emerald-700 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ShieldCheck size={18} />
                )}
                Verify & Approve
              </button>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
            <ShieldAlert className="mt-0.5 shrink-0 text-blue-600" size={20} />
            <p className="text-sm">
              <strong className="font-bold">Verification Required:</strong> Please review the extracted fields below. AI confidence scores are provided to help you prioritize which fields need the closest review.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            {[
              { id: "case", label: "Case Details" },
              { id: "action", label: "Action Plan" },
              { id: "raw", label: "Source Material" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div
            key={activeTab}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {activeTab === "case" && (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Case Number {getConfidenceBadge("case_details")}
                  </label>
                  <input
                    type="text"
                    value={case_details.case_number || ""}
                    onChange={(e) => handleNestedChange(["data", "extracted_data", "case_details", "case_number"], e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Court Name {getConfidenceBadge("case_details")}
                  </label>
                  <input
                    type="text"
                    value={case_details.court_name || ""}
                    onChange={(e) => handleNestedChange(["data", "extracted_data", "case_details", "court_name"], e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Date of Order {getConfidenceBadge("case_details")}
                  </label>
                  <input
                    type="text"
                    value={case_details.date_of_order || ""}
                    onChange={(e) => handleNestedChange(["data", "extracted_data", "case_details", "date_of_order"], e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Judgment Type {getConfidenceBadge("judgment_metadata")}
                  </label>
                  <input
                    type="text"
                    value={data.extracted_data.judgment_metadata.judgment_type || ""}
                    onChange={(e) => handleNestedChange(["data", "extracted_data", "judgment_metadata", "judgment_type"], e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Case Status {getConfidenceBadge("judgment_metadata")}
                  </label>
                  <input
                    type="text"
                    value={data.extracted_data.judgment_metadata.case_status || ""}
                    onChange={(e) => handleNestedChange(["data", "extracted_data", "judgment_metadata", "case_status"], e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Next Hearing Date {getConfidenceBadge("judgment_metadata")}
                  </label>
                  <input
                    type="text"
                    value={data.extracted_data.judgment_metadata.next_hearing_date || ""}
                    onChange={(e) => handleNestedChange(["data", "extracted_data", "judgment_metadata", "next_hearing_date"], e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Petitioner {getConfidenceBadge("case_details")}
                  </label>
                  <input
                    type="text"
                    value={case_details.petitioner || ""}
                    onChange={(e) => handleNestedChange(["data", "extracted_data", "case_details", "petitioner"], e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Respondent {getConfidenceBadge("case_details")}
                  </label>
                  <input
                    type="text"
                    value={case_details.respondent || ""}
                    onChange={(e) => handleNestedChange(["data", "extracted_data", "case_details", "respondent"], e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "action" && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-slate-700">
                      Action Type {getConfidenceBadge("action_type")}
                    </label>
                    <input
                      type="text"
                      value={action_plan.action_type || ""}
                      onChange={(e) => handleNestedChange(["data", "action_plan", "action_type"], e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-slate-700">
                      Responsible Department {getConfidenceBadge("responsible_department")}
                    </label>
                    <input
                      type="text"
                      value={action_plan.responsible_department || ""}
                      onChange={(e) => handleNestedChange(["data", "action_plan", "responsible_department"], e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Action Required {getConfidenceBadge("key_directions")}
                  </label>
                  <textarea
                    value={action_plan.action_required || ""}
                    onChange={(e) => handleNestedChange(["data", "action_plan", "action_required"], e.target.value)}
                    className="h-24 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Reasoning {getConfidenceBadge("overall")}
                  </label>
                  <textarea
                    value={action_plan.reasoning || ""}
                    onChange={(e) => handleNestedChange(["data", "action_plan", "reasoning"], e.target.value)}
                    className="h-32 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-bold text-slate-700">
                    Steps to Execute {getConfidenceBadge("overall")}
                  </label>
                  <div className="space-y-3">
                    {action_plan.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-sm text-blue-700">
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => {
                            const newSteps = [...action_plan.steps];
                            newSteps[idx] = e.target.value;
                            handleNestedChange(["data", "action_plan", "steps"], newSteps);
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "raw" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 p-4 text-blue-800">
                  <CheckCircle2 size={20} className="text-blue-600" />
                  <span className="text-sm font-medium">Raw text snippet extracted from the uploaded document for verification.</span>
                </div>
                <textarea
                  value={data.extracted_data.raw_text_snippet}
                  readOnly
                  className="h-64 w-full rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-600 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedWrapper>
  );
}
