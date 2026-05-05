"use client";

import Link from "next/link";
import { Scale, ShieldCheck, Zap, ArrowRight, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-500/30">
      
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-32 text-center md:py-48">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white"></div>
        
        <div className="relative z-10 flex max-w-4xl flex-col items-center gap-8">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm"
          >
            <Zap size={16} />
            <span>Next-Generation Legal Intelligence</span>
          </div>

          <h1
            className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl md:text-7xl"
          >
            Empower your practice with <br className="hidden md:block" />
            <span className="text-blue-700">
              AI-driven insights
            </span>
          </h1>

          <p
            className="max-w-2xl text-lg text-slate-600 md:text-xl"
          >
            NyayaSetuAI streamlines legal research, document analysis, and case preparation. Automate the tedious work and focus on what matters most—winning your case.
          </p>

          <div
            className="mt-4 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 rounded-full bg-blue-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all hover:bg-blue-800"
            >
              Get Started for Free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative border-t border-slate-200 bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Powerful features for legal professionals
            </h2>
            <p className="mt-4 text-slate-600">Everything you need to accelerate your legal workflows.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <FileText className="text-blue-700" size={28} />,
                title: "Document Analysis",
                description: "Upload large contracts and legal documents to instantly extract key clauses, risks, and summaries.",
              },
              {
                icon: <Scale className="text-blue-700" size={28} />,
                title: "Precedent Search",
                description: "Search through millions of case laws using natural language to find the most relevant precedents in seconds.",
              },
              {
                icon: <ShieldCheck className="text-blue-700" size={28} />,
                title: "Secure & Compliant",
                description: "Enterprise-grade security ensuring your client data remains strictly confidential and protected.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-6 inline-flex rounded-xl bg-blue-50 p-3 shadow-inner border border-blue-100">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500 font-medium">
        <p>&copy; {new Date().getFullYear()} NyayaSetuAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
