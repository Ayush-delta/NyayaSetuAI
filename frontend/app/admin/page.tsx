"use client";

import React, { useState, useEffect } from "react";
import ProtectedWrapper from "../components/ProtectedWrapper";
import { Users, Database, ShieldAlert, Activity, FileText, CheckCircle2, ServerCrash, RefreshCw } from "lucide-react";
import { documentService } from "../services/documentService";

export default function AdminPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  useEffect(() => {
    const docs = documentService.getAllDocuments();
    setStats({
      total: docs.length,
      pending: docs.filter(d => ["pending", "edited"].includes(d.data.verification_status)).length,
      approved: docs.filter(d => d.data.verification_status === "approved").length
    });
  }, []);

  return (
    <ProtectedWrapper adminOnly={true}>
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 sm:p-12">
        <div className="mx-auto max-w-6xl">
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl flex items-center gap-3">
              Admin Control Center
              <ShieldAlert className="text-blue-700" size={32} />
            </h1>
            <p className="mt-3 text-slate-600 max-w-2xl">
              Manage system configurations, user access levels, and monitor NyayaSetuAI's core infrastructure.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 opacity-20">
                <FileText size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-blue-100 font-medium tracking-wide">Total Documents</p>
                <h3 className="text-4xl font-bold mt-2">{stats.total}</h3>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 opacity-20">
                <Activity size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-orange-100 font-medium tracking-wide">Pending Review</p>
                <h3 className="text-4xl font-bold mt-2">{stats.pending}</h3>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 opacity-20">
                <CheckCircle2 size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-emerald-100 font-medium tracking-wide">Verified Final</p>
                <h3 className="text-4xl font-bold mt-2">{stats.approved}</h3>
              </div>
            </div>
          </div>

          <div>
            {/* User Management */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Users size={24} className="text-blue-600" /> User Management
                </h2>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">System Administrator</td>
                      <td className="px-4 py-3"><span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Admin</span></td>
                      <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Active</span></td>
                      <td className="px-4 py-3"><button className="text-blue-600 hover:underline">Edit</button></td>
                    </tr>
                    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">Government Officer</td>
                      <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Officer</span></td>
                      <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Active</span></td>
                      <td className="px-4 py-3"><button className="text-blue-600 hover:underline">Edit</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedWrapper>
  );
}
