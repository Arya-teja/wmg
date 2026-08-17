"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/services/user.service";
import { Loader2, UserRoundCheck, UserRoundX, Users } from "lucide-react";

interface UserListProps {
  users: User[];
  isLoading: boolean;
  isSaving: boolean;
  onUpdateRole: (id: string, role: "USER" | "ADMIN") => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
}

const ROLE_OPTIONS: Array<"USER" | "ADMIN"> = ["USER", "ADMIN"];

export function UserList({
  users,
  isLoading,
  isSaving,
  onUpdateRole,
  onDeactivate,
  onActivate,
}: UserListProps) {
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

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card">
        <Users className="size-10 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          Belum ada user terdaftar
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Nama</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Jumlah Order</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {user.name || "-"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  onChange={(e) =>
                    onUpdateRole(user.id, e.target.value as "USER" | "ADMIN")
                  }
                  disabled={isSaving}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-foreground">
                {user._count.orders}
              </td>
              <td className="px-4 py-3">
                {user.isActive ? (
                  <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                    Aktif
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-muted text-muted-foreground border-border"
                  >
                    Nonaktif
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  {user.isActive ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeactivate(user.id)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <UserRoundX />
                      )}
                      Nonaktifkan
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onActivate(user.id)}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <UserRoundCheck />
                      )}
                      Aktifkan
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
