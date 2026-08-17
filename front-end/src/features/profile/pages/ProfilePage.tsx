"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, clearUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password berhasil diperbarui. Silakan login kembali.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      clearUser();
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memperbarui password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // tetap bersihkan token lokal walau request logout ke server gagal
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      clearUser();
      router.push("/");
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="h-8 w-48 bg-muted animate-pulse mb-8" />
          <div className="h-64 bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="font-body text-sm text-muted-foreground mb-6">
            Silakan login untuk melihat profil kamu.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300"
          >
            Masuk
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-heading text-3xl tracking-wide text-foreground">
            Profil Saya
          </h1>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-body text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Keluar
          </button>
        </div>

        {/* Info Akun */}
        <div className="border border-border p-6 bg-background mb-8">
          <h2 className="font-heading text-lg text-foreground mb-6 pb-4 border-b border-border flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Informasi Akun
          </h2>
          <div className="space-y-4 font-body text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Nama</p>
              <p className="font-medium text-foreground">{user.name || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Ganti Password */}
        <div className="border border-border p-6 bg-background">
          <h2 className="font-heading text-lg text-foreground mb-6 pb-4 border-b border-border">
            Ganti Password
          </h2>

          {error && (
            <div
              role="alert"
              className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleChangePassword}
            noValidate
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="currentPassword"
                className="block font-body text-xs tracking-wider text-muted-foreground mb-2 uppercase"
              >
                Password Saat Ini
              </label>
              <input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block font-body text-xs tracking-wider text-muted-foreground mb-2 uppercase"
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-body text-xs tracking-wider text-muted-foreground mb-2 uppercase"
              >
                Konfirmasi Password Baru
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
