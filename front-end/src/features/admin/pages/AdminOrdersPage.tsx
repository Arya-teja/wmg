"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { Order } from "@/types";
import { AdminOrderTable } from "../components/AdminOrderTable";
import { getErrorMessage } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await orderService.getAllOrdersAdmin();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, "Gagal mengambil data pesanan"));
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

  const handleUpdateStatus = async (id: string, status: Order["status"]) => {
    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(id, status);
      toast.success("Status pesanan berhasil diubah");
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order)),
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengubah status pesanan"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola semua pesanan pelanggan.
        </p>
      </div>

      <AdminOrderTable
        orders={orders}
        isLoading={isLoading}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdating}
      />
    </div>
  );
}