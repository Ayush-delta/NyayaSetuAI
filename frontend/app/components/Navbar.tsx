"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthProvider";
import { LogOut, User, Menu, X, Scale } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Upload", href: "/upload" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Query", href: "/query" },
    { name: "Admin", href: "/admin" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white shadow-md">
            <Scale size={18} />
          </div>
          <span>NyayaSetu<span className="text-blue-600">AI</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="transition-colors hover:text-blue-600">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 font-medium">
                <User size={16} className="text-blue-600" />
                <span>{user.email ?? "user"}</span>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
                Login
              </Link>
              <Link href="/signup" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-transform hover:bg-blue-700">
                Signup
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="p-2 text-slate-600 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div
            className="border-t border-slate-200 bg-white px-6 py-4 shadow-lg md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-slate-700 transition-colors hover:text-blue-600"
                >
                  {link.name}
                </Link>
              ))}

              <div className="my-2 h-px w-full bg-slate-200"></div>

              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-slate-700 font-medium">
                    <User size={18} className="text-blue-600" />
                    <span>{user.email ?? "user"}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                  >
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
