"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Package } from "lucide-react";
import { Product, formatPrice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ProductTable({
  products,
  isLoading,
  onDelete,
  isDeleting,
}: ProductTableProps) {
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card">
        <Package className="size-10 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">Belum ada produk.</p>
        <Link
          href="/admin/products/new"
          className="text-sm font-medium text-accent hover:underline"
        >
          Tambah produk pertama
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Stok</th>
              <th className="px-4 py-3 font-medium">Ukuran</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {product.name}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">
                    {product.category?.name ?? "-"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatPrice(Number(product.price))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      (product.sizeStocks?.reduce(
                        (a, b) => a + (b.stock ?? 0),
                        0,
                      ) ?? 0) <= 0
                        ? "text-destructive font-medium"
                        : "text-foreground"
                    }
                  >
                    {product.sizeStocks && product.sizeStocks.length > 0
                      ? product.sizeStocks.reduce(
                          (a, b) => a + (b.stock ?? 0),
                          0,
                        )
                      : 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.sizeStocks && product.sizeStocks.length > 0
                    ? product.sizeStocks.map((s) => s.size).join(", ")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Pencil />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setProductToDelete(product)}
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
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Yakin mau menghapus produk{" "}
              <span className="font-medium text-foreground">
                {productToDelete?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (productToDelete) {
                  onDelete(productToDelete.id);
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
