import React from 'react';
import { Order } from '@/types';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getBadgeStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'PENDING': return 'Menunggu Pembayaran';
      case 'PAID': return 'Sudah Dibayar';
      case 'SHIPPED': return 'Dikirim';
      case 'DELIVERED': return 'Telah Sampai';
      case 'COMPLETED': return 'Selesai';
      case 'CANCELED': return 'Dibatalkan';
      default: return status;
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-body font-medium uppercase tracking-widest border ${getBadgeStyles()}`}>
      {getStatusText()}
    </span>
  );
}