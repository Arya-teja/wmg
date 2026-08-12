import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string | string[]
    }
  }
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as ApiErrorResponse).response?.data?.message
    if (Array.isArray(message)) return message[0] ?? fallback
    if (typeof message === "string") return message
  }
  return fallback
}
