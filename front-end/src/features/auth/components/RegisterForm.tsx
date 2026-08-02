"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react";
import { authService } from "@/services/auth.service";
import {
  RegisterFormData,
  RegisterFormErrors,
} from "@/features/auth/types/auth";
export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Pendaftaran gagal. Silakan coba lagi.";
      setErrors({ general: Array.isArray(message) ? message[0] : message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: keyof RegisterFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-7 h-7 text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Daftar untuk mulai berbelanja di WMG
          </p>
        </div>

        {errors.general && (
          <div
            role="alert"
            className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              placeholder="Nama kamu"
              className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-white"
              }`}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
              >
                {errors.name}
              </p>
            )}
          </div>

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
              value={formData.email}
              onChange={handleChange("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="nama@email.com"
              className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                errors.email
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-white"
              }`}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange("password")}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                placeholder="Minimal 6 karakter"
                className={`w-full px-4 py-2.5 pr-11 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
              >
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
                placeholder="Ulangi password"
                className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-gray-900 dark:focus:ring-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
              >
                {errors.confirmPassword}
              </p>
            )}
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
              "Daftar"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="font-medium text-gray-900 dark:text-white hover:underline"
          >
            Masuk sekarang
          </a>
        </p>
      </div>
    </div>
  );
}
