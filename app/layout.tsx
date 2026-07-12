import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "TransitOps – Smart Transport Operations Platform",
  description: "Enterprise-grade fleet management, dispatch, maintenance logging, fuel efficiency tracking, and operations analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased flex flex-col font-sans transition-colors duration-200">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
