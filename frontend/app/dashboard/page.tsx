"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Search, Calendar, ChevronRight, Building2, Clock, CheckCircle2 } from "lucide-react";
import ProtectedWrapper from "../components/ProtectedWrapper";
import { documentService, ProcessedDocument } from "../services/documentService";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    setDocuments(documentService.getAllDocuments());
  }, []);

  // Filter ONLY approved documents
  const approvedDocs = documents.filter((doc) => doc.data.verification_status === "approved");

  const filteredDocs = approvedDocs.filter((doc) =>
    doc.data.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.data.extracted_data.case_details.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.data.action_plan.responsible_department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedWrapper>
      <div className="min-h-[calc(100vh-73px)] bg-slate-50">
        <div className="mx-auto max-w-7xl p-6 sm:p-12">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl flex items-center gap-3">
                Decision Support Dashboard
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 size={16} /> Trusted View
                </span>
              </h1>
              <p className="mt-3 text-slate-600">
                Displaying only human-verified and approved action plans for execution.
              </p>
            </div>
            <button
              onClick={() => router.push("/upload")}
              className="flex items-center gap-2 rounded-full bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-800"
            >
              <Plus size={18} />
              Process New Judgment
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-8 flex max-w-md items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-500 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by department, case number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Documents Grid */}
          {filteredDocs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocs.map((doc, index) => {
                const { case_details } = doc.data.extracted_data;
                const { action_plan } = doc.data;

                return (
                  <div
                    key={doc.record_id}
                    onClick={() => router.push(`/case/${doc.record_id}`)}
                    className="group relative flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    {/* Header Strip */}
                    <div className="bg-slate-50 border-b border-slate-100 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <Building2 size={14} className="text-blue-600" />
                          Department
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                          action_plan.priority === "high" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {action_plan.priority} Priority
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {action_plan.responsible_department}
                      </h3>
                    </div>
                    
                    {/* Body Content */}
                    <div className="flex-1 p-5">
                      <div className="mb-4">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Action Required</span>
                        <p className="text-sm font-medium text-slate-800 line-clamp-3 leading-relaxed">
                          {action_plan.action_required}
                        </p>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                          {case_details.case_number}
                        </span>
                        <span className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 border border-blue-100 capitalize">
                          {action_plan.action_type}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 bg-white p-5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Deadline</p>
                          <p className="text-sm font-bold text-slate-900">{action_plan.deadline}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm font-bold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                        View Details <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                <CheckCircle2 className="text-emerald-600" size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">No approved plans found</h3>
              <p className="mb-6 max-w-md text-sm text-slate-500">
                {searchQuery ? "No verified plans match your search." : "There are currently no human-verified action plans waiting for execution. Process a new judgment to generate plans."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push("/upload")}
                  className="flex items-center gap-2 rounded-full bg-blue-700 px-6 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 shadow-md"
                >
                  <Plus size={16} />
                  Process New Judgment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedWrapper>
  );
}
