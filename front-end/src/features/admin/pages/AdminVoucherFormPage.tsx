"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VoucherForm } from "../components/VoucherForm";
import { Button } from "@/components/ui/button";

export default function AdminVoucherFormPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/vouchers")}
          className="mb-3 -ml-2"
        >
          <ArrowLeft />
          Kembali
        </Button>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Buat Voucher Baru
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lengkapi informasi voucher diskon. Semua field wajib diisi kecuali
          deskripsi.
        </p>
      </div>

      <VoucherForm />
    </div>
  );
}