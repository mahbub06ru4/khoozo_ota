import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { AuthModal } from "@/components/layout/AuthModal";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar, Navbar } from "@/components/layout/Navbar";
import { AppProvider } from "@/context/AppProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Khoozo — Flights, Hotels & Holidays", template: "%s · Khoozo" },
  description: "Search and book cheap flights, hotels and holiday packages from Bangladesh with transparent pricing.",
};

export const viewport: Viewport = {
  themeColor: "#d4141c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="flex min-h-dvh flex-col font-sans">
        <AppProvider>
          <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <Suspense>
            <MobileTabBar />
          </Suspense>
          <AuthModal />
        </AppProvider>
      </body>
    </html>
  );
}
