"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Product } from "@/types";
import { productService } from "@/services/product.service";
import { categoryService, Category } from "@/services/category.service";
import { ProductForm } from "../components/ProductForm";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

interface AdminProductFormPageProps {
  mode: "create" | "edit";
  productId?: string;
}

export default function AdminProductFormPage({
  mode,
  productId,
}: AdminProductFormPageProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEdit);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        console.error(getErrorMessage(err, "Gagal mengambil data kategori"));
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEdit || !productId) return;

    const fetchProduct = async () => {
      try {
        const data = await productService.getById(productId);
        setProduct(data);
      } catch (err) {
        console.error(getErrorMessage(err, "Gagal mengambil data produk"));
        router.push("/admin/products");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [isEdit, productId, router]);

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/products")}
          className="mb-3 -ml-2"
        >
          <ArrowLeft />
          Kembali
        </Button>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEdit
            ? "Perbarui informasi produk. Gambar dan warna tidak dapat diubah di sini."
            : "Lengkapi informasi produk baru."}
        </p>
      </div>

      <ProductForm
        mode={mode}
        product={product}
        categories={categories}
        isLoadingCategories={isLoadingCategories}
      />
    </div>
  );
}