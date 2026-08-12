"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { productService } from "@/services/product.service";
import { ProductTable } from "../components/ProductTable";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengambil data produk"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await productService.getAll();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, "Gagal mengambil data produk"));
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
      await productService.deleteProduct(id);
      toast.success("Produk berhasil dihapus");
      await fetchProducts(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menghapus produk"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola produk toko Anda.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus />
            Tambah Produk
          </Link>
        </Button>
      </div>

      <ProductTable
        products={products}
        isLoading={isLoading}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}