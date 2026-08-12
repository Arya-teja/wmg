"use client";

import { useState } from "react";
import { Trash2, TicketPercent } from "lucide-react";
import { Voucher } from "@/services/voucher.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VoucherTableProps {
  vouchers: Voucher[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDiscountValue(voucher: Voucher): string {
  return voucher.discountType === "PERCENTAGE"
    ? `${Number(voucher.discountValue)}%`
    : formatPrice(Number(voucher.discountValue));
}

export function VoucherTable({
  vouchers,
  isLoading,
  onDelete,
  isDeleting,
}: VoucherTableProps) {
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-14 bg-muted animate-pulse border border-border"
          />
        ))}
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card">
        <TicketPercent className="size-10 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Belum ada voucher.
        </p>
        <Button asChild>
          <a href="/admin/vouchers/new">
            <TicketPercent />
            Buat Voucher
          </a>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Tipe Diskon</th>
              <th className="px-4 py-3 font-medium">Nilai Diskon</th>
              <th className="px-4 py-3 font-medium">Kuota</th>
              <th className="px-4 py-3 font-medium">Berlaku Hingga</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr
                key={voucher.id}
                className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {voucher.code}
                  </span>
                  {voucher.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {voucher.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">
                    {voucher.discountType === "PERCENTAGE"
                      ? "Persentase"
                      : "Nominal"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatDiscountValue(voucher)}
                </td>
                <td className="px-4 py-3 text-foreground">{voucher.quota}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(voucher.expiresAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setVoucherToDelete(voucher)}
                    >
                      <Trash2 />
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!voucherToDelete}
        onOpenChange={(open) => {
          if (!open) setVoucherToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Voucher</DialogTitle>
            <DialogDescription>
              Yakin mau menghapus voucher{" "}
              <span className="font-medium text-foreground">
                {voucherToDelete?.code}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVoucherToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (voucherToDelete) {
                  onDelete(voucherToDelete.id);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}