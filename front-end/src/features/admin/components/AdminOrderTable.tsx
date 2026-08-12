"use client";

import { Order, formatPrice } from "@/types";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge";
import { ShoppingBag } from "lucide-react";

interface AdminOrderTableProps {
  orders: Order[];
  isLoading: boolean;
  onUpdateStatus: (id: string, status: Order["status"]) => void;
  isUpdating: boolean;
}

const ORDER_STATUSES: Order["status"][] = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELED",
];

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SUCCESS: "bg-green-100 text-green-800 border-green-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-200",
};

const PAYMENT_STATUS_TEXT: Record<string, string> = {
  PENDING: "Menunggu",
  SUCCESS: "Sukses",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatItemsSummary(order: Order): string {
  if (order.items.length === 0) return "-";
  const firstItem = order.items[0].product?.name || "Produk";
  if (order.items.length === 1) return firstItem;
  return `${firstItem} dan ${order.items.length - 1} lainnya`;
}

export function AdminOrderTable({
  orders,
  isLoading,
  onUpdateStatus,
  isUpdating,
}: AdminOrderTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-muted animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card">
        <ShoppingBag className="size-10 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Pemesan</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status Order</th>
            <th className="px-4 py-3 font-medium">Status Payment</th>
            <th className="px-4 py-3 font-medium">Ubah Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <td className="px-4 py-3">
                <span className="font-medium text-foreground">{order.user?.name || "-"}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{order.user?.email || "-"}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3 text-foreground">{formatItemsSummary(order)}</td>
              <td className="px-4 py-3 text-foreground font-medium">{formatPrice(Number(order.grandTotal))}</td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                {order.payment ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-body font-medium uppercase tracking-widest border ${PAYMENT_STATUS_STYLES[order.payment.status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                    {PAYMENT_STATUS_TEXT[order.payment.status] || order.payment.status}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value as Order["status"])}
                  disabled={isUpdating}
                  className="px-2.5 py-1.5 border border-border bg-transparent font-body text-xs text-foreground focus:outline-none focus:border-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}