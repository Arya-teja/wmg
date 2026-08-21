"use client";

import { useState, FormEvent } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Tags,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Category } from "@/services/category.service";
import { uploadService } from "@/services/upload.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/utils";
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
  onCreate: (
    name: string,
    imageUrl?: string,
    publicId?: string,
  ) => Promise<void>;
  onUpdate: (
    id: string,
    name: string,
    imageUrl?: string,
    publicId?: string,
  ) => Promise<void>;
  onDelete: (id: string) => void;
}

interface CategoryImageState {
  url?: string;
  publicId?: string;
  localUrl?: string;
  uploading: boolean;
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
  const [image, setImage] = useState<CategoryImageState>({ uploading: false });
  const [imageError, setImageError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const isEdit = !!editingCategory;

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setNameError("");
    setImage({ uploading: false });
    setImageError("");
    setFormOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setNameError("");
    setImage({
      url: category.imageUrl ?? undefined,
      publicId: category.publicId ?? undefined,
      uploading: false,
    });
    setImageError("");
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (isSaving) return;
    setFormOpen(false);
    setEditingCategory(null);
    setName("");
    setNameError("");
    setImage({ uploading: false });
    setImageError("");
  };

  const handleImageSelected = async (file: File | undefined) => {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImage({ localUrl, uploading: true });
    setImageError("");

    try {
      const uploadedImage = await uploadService.uploadImage(file);
      setImage({
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
        uploading: false,
      });
    } catch (err) {
      setImage({ uploading: false });
      toast.error(getErrorMessage(err, "Gagal mengunggah gambar kategori"));
    }
  };

  const clearImage = () => {
    setImage({ uploading: false });
    setImageError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Nama kategori wajib diisi");
      return;
    }
    if (image.uploading) {
      setImageError("Tunggu gambar selesai diunggah");
      return;
    }
    try {
      if (isEdit && editingCategory) {
        await onUpdate(editingCategory.id, trimmed, image.url, image.publicId);
      } else {
        await onCreate(trimmed, image.url, image.publicId);
      }
      setFormOpen(false);
      setEditingCategory(null);
      setName("");
      setNameError("");
      setImage({ uploading: false });
      setImageError("");
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

  return (
    <>
      <div className="flex items-center justify-end mb-3">
        <Button onClick={openCreateDialog}>
          <Plus />
          Tambah Kategori
        </Button>
      </div>

      {categories.length === 0 ? (
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
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Gambar</th>
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
                  <td className="px-4 py-3">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={`Gambar ${category.name}`}
                        className="h-10 w-10 rounded object-cover border border-border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded border border-dashed border-border bg-muted/40 flex items-center justify-center">
                        <ImageIcon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
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
      )}

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
            <div className="space-y-4">
              <div>
                <Label>Gambar Kategori (opsional)</Label>
                <div className="mt-1.5 flex items-start gap-3">
                  <div className="h-24 w-24 rounded-lg border border-border bg-muted/30 overflow-hidden flex items-center justify-center">
                    {image.localUrl || image.url ? (
                      <img
                        src={image.localUrl ?? image.url}
                        alt="Preview kategori"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="size-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="category-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        void handleImageSelected(e.target.files?.[0]);
                        e.currentTarget.value = "";
                      }}
                      disabled={isSaving || image.uploading}
                    />

                    <div className="flex items-center gap-2">
                      {image.uploading && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          Mengunggah gambar...
                        </span>
                      )}

                      {(image.localUrl || image.url) && !image.uploading && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearImage}
                          disabled={isSaving}
                        >
                          <X />
                          Hapus Gambar
                        </Button>
                      )}
                    </div>

                    {imageError && (
                      <p className="text-sm text-destructive">{imageError}</p>
                    )}
                  </div>
                </div>
              </div>

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
