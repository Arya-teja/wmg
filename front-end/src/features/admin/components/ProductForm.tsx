"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Product, ProductLabel } from "@/types";
import { Category } from "@/services/category.service";
import {
  productService,
  CreateProductPayload,
} from "@/services/product.service";
import { uploadService } from "@/services/upload.service";
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
  categoryId?: string;
  sizeStocks?: string;
  colors?: string;
  images?: string;
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
    product ? String(Number(product.price)) : "",
  );
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [label, setLabel] = useState<ProductLabel | "">(product?.label ?? "");
  const [sizeStocks, setSizeStocks] = useState<
    { size: string; stock: string }[]
  >(
    product && product.sizeStocks && product.sizeStocks.length > 0
      ? product.sizeStocks.map((s) => ({
          size: s.size,
          stock: String(s.stock),
        }))
      : [],
  );
  const [sizeInput, setSizeInput] = useState("");
  const [sizeInputStock, setSizeInputStock] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [colors, setColors] = useState<{ name: string; hex: string }[]>(
    product && product.colors && product.colors.length > 0
      ? product.colors.map((c) => ({ name: c.name, hex: c.hex }))
      : [],
  );
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#ff0000");

  const [images, setImages] = useState<
    { url?: string; publicId?: string; uploading: boolean; localUrl?: string }[]
  >(
    product && product.images && product.images.length > 0
      ? product.images.map((img) => ({
          url: img.url,
          publicId: img.publicId ?? undefined,
          uploading: false,
        }))
      : [],
  );

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

    if (!categoryId) {
      newErrors.categoryId = "Kategori wajib dipilih";
    }

    // validate sizeStocks
    if (!sizeStocks || sizeStocks.length === 0) {
      newErrors.sizeStocks = "Minimal satu ukuran wajib ditambahkan";
    } else {
      for (const s of sizeStocks) {
        if (s.stock === "" || Number.isNaN(Number(s.stock))) {
          newErrors.sizeStocks =
            "Semua ukuran harus memiliki nilai stok (boleh 0)";
          break;
        }
      }
    }

    if (!colors || colors.length === 0) {
      newErrors.colors = "Minimal satu warna wajib ditambahkan";
    }

    if (!images || images.length !== 3) {
      newErrors.images = "Harus ada tepat 3 gambar produk yang ter-upload";
    }

    // Check if any images are still uploading
    if (images.some((img) => img.uploading)) {
      newErrors.images = "Tunggu semua gambar selesai diunggah";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSize = () => {
    const value = sizeInput.trim().toUpperCase();
    const stockVal = sizeInputStock.trim();
    if (!value) return;
    if (sizeStocks.some((s) => s.size === value)) {
      setSizeInput("");
      setSizeInputStock("");
      return;
    }
    setSizeStocks((prev) => [...prev, { size: value, stock: stockVal }]);
    setSizeInput("");
    setSizeInputStock("");
  };

  const removeSize = (size: string) => {
    setSizeStocks((prev) => prev.filter((s) => s.size !== size));
  };

  const togglePresetSize = (size: string) => {
    const exists = sizeStocks.find((s) => s.size === size);
    if (exists) {
      removeSize(size);
    } else {
      setSizeStocks((prev) => [...prev, { size, stock: "" }]);
    }
  };

  const updateSizeStock = (size: string, stock: string) => {
    setSizeStocks((prev) =>
      prev.map((s) => (s.size === size ? { ...s, stock } : s)),
    );
  };

  const addColor = () => {
    const name = colorName.trim();
    const hex = colorHex.trim();
    if (!name) return;
    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setColorName("");
      return;
    }
    setColors((prev) => [...prev, { name, hex }]);
    setColorName("");
  };

  const removeColor = (name: string) => {
    setColors((prev) => prev.filter((c) => c.name !== name));
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    // decide available slots
    const slotsLeft = Math.max(0, 3 - images.length);
    if (fileArray.length > slotsLeft) {
      toast(
        `Hanya ${slotsLeft} gambar lagi yang diperlukan. Mengambil ${slotsLeft} pertama.`,
      );
    }
    const toUpload = fileArray.slice(0, slotsLeft);
    for (const file of toUpload) {
      const localUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { localUrl, uploading: true }]);
      try {
        const uploadedImage = await uploadService.uploadImage(file);
        setImages((prev) => {
          const idx = prev.findIndex(
            (p) => p.localUrl === localUrl && p.uploading,
          );
          if (idx === -1) return prev.map((p) => ({ ...p }));
          const next = [...prev];
          next[idx] = {
            url: uploadedImage.url,
            publicId: uploadedImage.publicId,
            uploading: false,
          };
          return next;
        });
      } catch (err) {
        const msg = getErrorMessage(err, "Gagal mengunggah gambar");
        toast.error(msg);
        setImages((prev) => prev.filter((p) => p.localUrl !== localUrl));
      }
    }
  };

  const removeImageAt = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    const payload: CreateProductPayload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      categoryId,
      label: label || undefined,
      sizeStocks: sizeStocks.map((s) => ({
        size: s.size,
        stock: Number(s.stock),
      })),
      images: images.map((img, i) => ({
        url: img.url ?? "",
        publicId: img.publicId,
        order: i,
      })),
      colors: colors.map((c) => ({ name: c.name, hex: c.hex })),
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
        isEdit ? "Gagal memperbarui produk" : "Gagal membuat produk",
      );
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-6">
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

      {/* Harga */}
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
          <p className="mt-1.5 text-sm text-destructive">{errors.categoryId}</p>
        )}
      </div>

      {/* Label Produk */}
      <div>
        <Label htmlFor="label">Label Produk (opsional)</Label>
        <select
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value as ProductLabel | "")}
          className="mt-1.5 h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Tidak ada label</option>
          <option value="BEST_SELLER">Best Seller</option>
          <option value="NEW_ARRIVAL">New Arrival</option>
        </select>
      </div>

      {/* Ukuran & Stok */}
      <div>
        <Label>Ukuran & Stok</Label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {DEFAULT_SIZES.map((size) => {
            const item = sizeStocks.find((s) => s.size === size);
            return (
              <div key={size} className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePresetSize(size)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    item
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {size}
                </button>
                {item && (
                  <Input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => updateSizeStock(size, e.target.value)}
                    placeholder="stok"
                    className="w-20"
                    aria-label={`Stok untuk ukuran ${size}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <Input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder="Tambah ukuran custom (cth: XXL)"
            className="max-w-xs"
          />
          <Input
            value={sizeInputStock}
            onChange={(e) => setSizeInputStock(e.target.value)}
            placeholder="stok"
            className="w-24"
            type="number"
            min="0"
          />
          <Button type="button" variant="outline" onClick={addSize}>
            <Plus />
            Tambah
          </Button>
        </div>

        {sizeStocks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sizeStocks.map((s) => (
              <span
                key={s.size}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-secondary-foreground px-2.5 py-1 text-sm"
              >
                {s.size} • {s.stock === "" ? "-" : s.stock}
                <button
                  type="button"
                  onClick={() => removeSize(s.size)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Hapus ukuran ${s.size}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.sizeStocks && (
          <p className="mt-1.5 text-sm text-destructive">{errors.sizeStocks}</p>
        )}
      </div>

      {/* Warna */}
      <div>
        <Label>Warna</Label>
        <div className="mt-3 flex gap-2 items-center">
          <Input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Nama warna (cth: Merah Marun)"
            className="max-w-xs"
          />
          <div className="flex items-center gap-2">
            <input
              aria-label="Pilih warna hex"
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-10 h-10 p-0 rounded-md border"
            />
            <Input
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-28"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addColor}
            aria-label="Tambah warna"
          >
            <Plus />
            Tambah Warna
          </Button>
        </div>

        {colors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary text-secondary-foreground px-2.5 py-1 text-sm"
              >
                <span
                  className="w-4 h-4 rounded-sm"
                  style={{ background: c.hex }}
                />
                {c.name}
                <button
                  type="button"
                  onClick={() => removeColor(c.name)}
                  aria-label={`Hapus warna ${c.name}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.colors && (
          <p className="mt-1.5 text-sm text-destructive">{errors.colors}</p>
        )}
      </div>

      {/* Gambar Produk */}
      <div>
        <div className="flex items-center justify-between">
          <Label>Gambar Produk</Label>
          <span className="text-sm text-muted-foreground">
            {images.length}/3 gambar
          </span>
        </div>
        <input
          aria-label="Unggah gambar produk"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          className={`mt-2 ${images.length >= 3 ? "hidden" : "block"}`}
        />
        {errors.images && (
          <p className="mt-1.5 text-sm text-destructive">{errors.images}</p>
        )}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={img.publicId ?? img.localUrl ?? i}
              className="relative w-full aspect-square rounded overflow-hidden border"
            >
              {img.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
              <img
                src={img.url ?? img.localUrl}
                alt={`Gambar ${i + 1}`}
                className="object-cover w-full h-full"
              />
              {!img.uploading && (
                <button
                  type="button"
                  onClick={() => removeImageAt(i)}
                  aria-label={`Hapus gambar ${i + 1}`}
                  className="absolute top-1 right-1 bg-destructive/10 rounded p-1"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
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
