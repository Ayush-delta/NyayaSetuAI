"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, ShieldCheck, FileText, Scale } from "lucide-react";
import ProtectedWrapper from "../../components/ProtectedWrapper";
import { documentService, ProcessedDocument } from "../../services/documentService";

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [document, setDocument] = useState<ProcessedDocument | null>(null);

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
  const { case_details, judgment_metadata } = data.extracted_data;
  const { action_plan } = data;

  return (
    <ProtectedWrapper>
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* Header Card */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Scale size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {case_details.petitioner && case_details.petitioner !== "null" && case_details.respondent && case_details.respondent !== "null" ? (
                    <>
                      {case_details.petitioner} <span className="text-slate-400 font-normal">vs.</span> {case_details.respondent}
                    </>
                  ) : (
                    case_details.petitioner !== "null" ? case_details.petitioner : 
                    case_details.respondent !== "null" ? case_details.respondent : 
                    "Case Parties Not Extracted"
                  )}
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                  {case_details.case_number} • {case_details.court_name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-100">
                <ShieldCheck size={16} />
                Verified Record
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 border border-slate-200">
                {judgment_metadata.judgment_type}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${
                action_plan.priority === "high" ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}>
                {action_plan.priority.charAt(0).toUpperCase() + action_plan.priority.slice(1)} Priority
              </span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Action Plan */}
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-blue-600" size={20} />
                  Action Plan
                </h2>
                
                <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Action Required</h3>
                  <p className="text-slate-900 font-medium leading-relaxed">{action_plan.action_required}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Steps to Execute</h3>
                  <ul className="space-y-4">
                    {action_plan.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-4 items-start">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-sm text-blue-700 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed pt-1">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Reasoning</h3>
                  <p className="text-slate-700 leading-relaxed">{action_plan.reasoning}</p>
                </div>
              </section>

              {/* Extracted Snippet */}
              <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  Source Document Excerpt
                </h2>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 rounded-l-xl"></div>
                  <p className="font-mono text-sm leading-relaxed text-slate-600">
                    "{data.extracted_data.raw_text_snippet}"
                  </p>
                </div>
              </section>

            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-8">
              
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Assignment Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Responsible Department</span>
                    <span className="block text-sm font-medium text-slate-900 mt-1">{action_plan.responsible_department}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Action Type</span>
                    <span className="block text-sm font-medium text-slate-900 mt-1 capitalize">{action_plan.action_type}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Deadline</span>
                    <span className="block text-sm font-medium text-red-600 mt-1">{action_plan.deadline}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Case Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Date of Order</span>
                    <span className="block text-sm font-medium text-slate-900 mt-1">{case_details.date_of_order}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Subject Matter</span>
                    <span className="block text-sm font-medium text-slate-900 mt-1">{judgment_metadata.subject_matter}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Relief Granted</span>
                    <span className="block text-sm font-medium text-slate-900 mt-1">{judgment_metadata.relief_granted}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  System Metadata
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Filename</span>
                    <span className="block text-sm font-medium text-slate-900 mt-1 truncate" title={data.filename}>{data.filename}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Processed On</span>
                    <span className="block text-sm font-medium text-slate-900 mt-1">
                      {new Date(data.upload_timestamp).toLocaleDateString()} {new Date(data.upload_timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Verification Status</span>
                    <span className="block text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </ProtectedWrapper>
  );
}
