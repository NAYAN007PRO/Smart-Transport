import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // Fetch unread notifications count
  let unreadCount = 0;
  try {
    unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });
  } catch (error) {
    console.error("Failed to count notifications:", error);
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Responsive Sidebar */}
      <Sidebar currentUser={currentUser} unreadNotifications={unreadCount} />

      {/* Main Content Pane */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-8 flex flex-col no-scrollbar">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
