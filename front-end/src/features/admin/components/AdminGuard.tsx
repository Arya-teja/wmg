"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { authService } from "@/services/auth.service";

type GuardState = "checking" | "authorized" | "unauthorized";

function decodeJwtRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const data = JSON.parse(json);
    return data?.role ?? null;
  } catch {
    return null;
  }
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (!token) {
        router.replace("/");
        return;
      }

      // Cek role dari JWT payload dulu (cepat, tanpa network)
      const roleFromToken = decodeJwtRole(token);
      if (roleFromToken === "ADMIN") {
        if (!cancelled) setState("authorized");
        return;
      }

      // Fallback: verifikasi via GET /auth/profile
      try {
        const profile = await authService.getProfile();
        if (!cancelled) {
          setState(profile?.role === "ADMIN" ? "authorized" : "unauthorized");
        }
      } catch {
        if (!cancelled) {
          // 401 sudah ditangani interceptor (redirect ke /login)
          setState("unauthorized");
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "checking") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (state === "unauthorized") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto size-14 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
            <ShieldAlert className="size-7 text-destructive" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-foreground mb-2">
            Akses Ditolak
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Anda tidak memiliki izin untuk mengakses halaman admin. Halaman ini
            khusus untuk pengguna dengan role ADMIN.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}