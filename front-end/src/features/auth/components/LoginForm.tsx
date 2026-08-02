"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShoppingBag } from "lucide-react";
import { authService } from "@/services/auth.service";
import { LoginFormData, LoginFormErrors } from "@/features/auth/types/auth";

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation function
  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    // Proceed with login
    setIsLoading(true);
    try {
      const response = await authService.login(formData);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Login gagal. Periksa email dan password kamu.";
      setErrors({ general: Array.isArray(message) ? message[0] : message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 sm:p-10">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-7 h-7 text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Masuk ke akun WMG kamu untuk melanjutkan belanja
          </p>
        </div>

        {/* General error banner */}
        {errors.general && (
          <div
            role="alert"
            className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
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

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Lupa password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange("password")}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                placeholder="••••••••"
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

          {/* Submit */}
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
              "Masuk"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="font-medium text-gray-900 dark:text-white hover:underline"
          >
            Daftar sekarang
          </a>
        </p>
      </div>
    </div>
  );
}
