"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User, userService } from "@/services/user.service";
import { UserList } from "../components/UserList";
import { getErrorMessage } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await userService.getAll();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, "Gagal mengambil data user"));
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

  const handleUpdateRole = async (id: string, role: "USER" | "ADMIN") => {
    setIsSaving(true);
    try {
      await userService.updateRole(id, role);
      toast.success("Role user berhasil diperbarui");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal memperbarui role user"));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setIsSaving(true);
    try {
      await userService.deactivate(id);
      toast.success("User berhasil dinonaktifkan");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menonaktifkan user"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (id: string) => {
    setIsSaving(true);
    try {
      await userService.activate(id);
      toast.success("User berhasil diaktifkan kembali");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengaktifkan user"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Kelola User
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola akun pengguna dan hak akses admin di toko Anda.
        </p>
      </div>

      <UserList
        users={users}
        isLoading={isLoading}
        isSaving={isSaving}
        onUpdateRole={handleUpdateRole}
        onDeactivate={handleDeactivate}
        onActivate={handleActivate}
      />
    </div>
  );
}
