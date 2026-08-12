"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { categoryService, Category } from "@/services/category.service";
import { CategoryList } from "../components/CategoryList";
import { getErrorMessage } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await categoryService.getAll();
        if (!cancelled) setCategories(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, "Gagal mengambil data kategori"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleCreate = async (name: string) => {
    setIsSaving(true);
    try {
      await categoryService.create({ name });
      toast.success("Kategori berhasil dibuat");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal membuat kategori"));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (id: string, name: string) => {
    setIsSaving(true);
    try {
      await categoryService.update(id, { name });
      toast.success("Kategori berhasil diperbarui");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal memperbarui kategori"));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await categoryService.delete(id);
      toast.success("Kategori berhasil dihapus");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menghapus kategori"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Categories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola kategori produk toko Anda.
        </p>
      </div>

      <CategoryList
        categories={categories}
        isLoading={isLoading}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}