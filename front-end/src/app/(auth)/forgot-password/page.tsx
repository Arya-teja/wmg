"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, Mail, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Masukkan email yang valid");
      return;
    }

    setIsLoading(true);
    try {
      const { resetUrl } = await authService.forgotPassword(email);
      setResetUrl(resetUrl);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Gagal memproses permintaan. Silakan coba lagi.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToReset = () => {
    if (!resetUrl) return;
    try {
      const url = new URL(resetUrl);
      router.push(`${url.pathname}${url.search}`);
    } catch {
      setError(
        "Link reset tidak valid. Pastikan FRONTEND_URL sudah dikonfigurasi dengan benar di backend.",
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-white dark:text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lupa Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
              Masukkan email akun kamu, kami akan bantu buatkan link untuk atur
              password baru
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Kirim Permintaan
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Ingat password kamu?{" "}
            <a
              href="/login"
              className="font-medium text-gray-900 dark:text-white hover:underline"
            >
              Masuk di sini
            </a>
          </p>
        </div>
      </div>

      {/* Pop-up modal setelah permintaan berhasil */}
      {resetUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Permintaan Diterima
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Klik tombol di bawah untuk mengatur password baru kamu. Link ini
              berlaku selama 1 jam.
            </p>
            <button
              onClick={handleGoToReset}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Atur Password Baru
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
