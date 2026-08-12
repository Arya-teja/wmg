"use client";

import { useState, FormEvent } from "react";
import { Pencil, Trash2, Plus, Loader2, Tags } from "lucide-react";
import { Category } from "@/services/category.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export function CategoryList({
  categories,
  isLoading,
  isSaving,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const isEdit = !!editingCategory;

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setNameError("");
    setFormOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setNameError("");
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (isSaving) return;
    setFormOpen(false);
    setEditingCategory(null);
    setName("");
    setNameError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Nama kategori wajib diisi");
      return;
    }
    try {
      if (isEdit && editingCategory) {
        await onUpdate(editingCategory.id, trimmed);
      } else {
        await onCreate(trimmed);
      }
      // Tutup modal langsung (tanpa guard isSaving yang masih true saat ini)
      setFormOpen(false);
      setEditingCategory(null);
      setName("");
      setNameError("");
    } catch {
      // Pesan error ditampilkan oleh parent (toast)
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-12 bg-muted animate-pulse border border-border"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card">
        <Tags className="size-10 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          Belum ada kategori.
        </p>
        <Button onClick={openCreateDialog}>
          <Plus />
          Tambah Kategori
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end mb-3">
        <Button onClick={openCreateDialog}>
          <Plus />
          Tambah Kategori
        </Button>
      </div>
      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {category.name}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{category.slug}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setCategoryToDelete(category)}
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

      {/* Form create/edit */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Kategori" : "Tambah Kategori"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Perbarui nama kategori."
                : "Masukkan nama kategori baru. Slug dibuat otomatis oleh backend."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} noValidate>
            <div>
              <Label htmlFor="category-name">Nama Kategori</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                aria-invalid={!!nameError}
                placeholder="cth: Kemeja"
                className="mt-1.5"
                autoFocus
              />
              {nameError && (
                <p className="mt-1.5 text-sm text-destructive">{nameError}</p>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeFormDialog}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin" />}
                {isEdit ? "Simpan Perubahan" : "Buat Kategori"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi delete */}
      <Dialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Yakin mau menghapus kategori{" "}
              <span className="font-medium text-foreground">
                {categoryToDelete?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (categoryToDelete) {
                  onDelete(categoryToDelete.id);
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