"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  TicketPercent,
  ShoppingCart,
  Store,
  LogOut,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";

const NAV_ITEMS = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/vouchers", label: "Vouchers", icon: TicketPercent },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // tetap bersihkan token lokal walau request logout gagal
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-sm font-semibold text-foreground">
              WMG Admin
            </p>
            <p className="text-[11px] text-muted-foreground">Panel Manajemen</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Store className="size-4" />
          Lihat Toko
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
