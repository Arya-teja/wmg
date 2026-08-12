"use client";

import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}