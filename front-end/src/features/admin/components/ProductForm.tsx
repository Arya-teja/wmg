"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { Category } from "@/services/category.service";
import {
  productService,
  CreateProductPayload,
} from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/utils";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product | null;
  categories: Category[];
  isLoadingCategories: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  categoryId?: string;
  sizes?: string;
  general?: string;
}

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

export function ProductForm({
  mode,
  product,
  categories,
  isLoadingCategories,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product ? String(Number(product.price)) : ""
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [sizes, setSizes] = useState<string[]>(
    product && product.sizes.length > 0 ? product.sizes : []
  );
  const [sizeInput, setSizeInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Nama produk wajib diisi";
    }

    if (!description.trim()) {
      newErrors.description = "Deskripsi wajib diisi";
    }

    if (price === "" || Number(price) < 0) {
      newErrors.price = "Harga wajib diisi dan tidak boleh negatif";
    }

    if (stock === "" || Number(stock) < 0) {
      newErrors.stock = "Stok wajib diisi dan tidak boleh negatif";
    }

    if (!categoryId) {
      newErrors.categoryId = "Kategori wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSize = () => {
    const value = sizeInput.trim().toUpperCase();
    if (!value) return;
    if (sizes.includes(value)) {
      setSizeInput("");
      return;
    }
    setSizes((prev) => [...prev, value]);
    setSizeInput("");
  };

  const removeSize = (size: string) => {
    setSizes((prev) => prev.filter((s) => s !== size));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    const payload: CreateProductPayload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      categoryId,
      sizes,
    };

    setIsSubmitting(true);
    try {
      if (isEdit && product) {
        await productService.updateProduct(product.id, payload);
        toast.success("Produk berhasil diperbarui");
      } else {
        await productService.createProduct(payload);
        toast.success("Produk berhasil dibuat");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const message = getErrorMessage(
        err,
        isEdit ? "Gagal memperbarui produk" : "Gagal membuat produk"
      );
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-2xl space-y-6"
    >
      {errors.general && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
        >
          {errors.general}
        </div>
      )}

      {/* Nama */}
      <div>
        <Label htmlFor="name">Nama Produk</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          placeholder="cth: Kemeja Batik Pria"
          className="mt-1.5"
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Deskripsi */}
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!errors.description}
          placeholder="Deskripsi singkat produk"
          rows={4}
          className="mt-1.5 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-destructive">
            {errors.description}
          </p>
        )}
      </div>

      {/* Harga & Stok */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Harga (Rp)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-invalid={!!errors.price}
            placeholder="cth: 250000"
            className="mt-1.5"
          />
          {errors.price && (
            <p className="mt-1.5 text-sm text-destructive">{errors.price}</p>
          )}
        </div>
        <div>
          <Label htmlFor="stock">Stok</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            aria-invalid={!!errors.stock}
            placeholder="cth: 50"
            className="mt-1.5"
          />
          {errors.stock && (
            <p className="mt-1.5 text-sm text-destructive">{errors.stock}</p>
          )}
        </div>
      </div>

      {/* Kategori */}
      <div>
        <Label htmlFor="categoryId">Kategori</Label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-invalid={!!errors.categoryId}
          disabled={isLoadingCategories}
          className="mt-1.5 h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <option value="">
            {isLoadingCategories ? "Memuat kategori..." : "Pilih kategori"}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1.5 text-sm text-destructive">
            {errors.categoryId}
          </p>
        )}
      </div>

      {/* Ukuran */}
      <div>
        <Label>Ukuran</Label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {DEFAULT_SIZES.map((size) => {
            const isSelected = sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() =>
                  isSelected ? removeSize(size) : setSizes((prev) => [...prev, size])
                }
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSize();
              }
            }}
            placeholder="Tambah ukuran custom (cth: XXL)"
            className="max-w-xs"
          />
          <Button type="button" variant="outline" onClick={addSize}>
            <Plus />
            Tambah
          </Button>
        </div>
        {sizes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-secondary-foreground px-2.5 py-1 text-sm"
              >
                {size}
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Hapus ukuran ${size}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isEdit ? "Simpan Perubahan" : "Buat Produk"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={isSubmitting}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}