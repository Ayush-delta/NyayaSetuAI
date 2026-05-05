import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./context/AuthProvider";
import Navbar from "./components/Navbar";
import ClientOnly from "./components/ClientOnly";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NyayaSetuAI",
  description: "Legal AI platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning={true} className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <ClientOnly>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
