"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { voucherService, Voucher } from "@/services/voucher.service";
import { VoucherTable } from "../components/VoucherTable";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await voucherService.getAll();
        if (!cancelled) setVouchers(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, "Gagal mengambil data voucher"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await voucherService.delete(id);
      toast.success("Voucher berhasil dihapus");
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menghapus voucher"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Vouchers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola voucher diskon toko Anda.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/vouchers/new">
            <Plus />
            Buat Voucher
          </Link>
        </Button>
      </div>

      <VoucherTable
        vouchers={vouchers}
        isLoading={isLoading}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}