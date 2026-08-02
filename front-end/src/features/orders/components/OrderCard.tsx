import Image from 'next/image';
import Link from 'next/link';
import { Order, formatPrice } from '@/types';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(order.createdAt));

  const firstItem = order.items[0];
  const additionalItemsCount = order.items.length - 1;

  return (
    <div className="border border-border p-4 md:p-6 hover:border-foreground transition-colors bg-background">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-border pb-4 mb-4">
        <div>
          <p className="font-body text-xs text-muted-foreground mb-1">{formattedDate}</p>
          <p className="font-body text-sm font-medium">ID Pesanan: {order.id.slice(-8).toUpperCase()}</p>
        </div>
        <div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex gap-4 items-center">
          <div className="relative w-20 h-24 bg-muted flex-shrink-0">
            <Image
              src={firstItem?.product.imageUrl || '/placeholder.jpg'}
              alt={firstItem?.product.name || 'Product Image'}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-heading text-sm font-medium text-foreground line-clamp-1">
              {firstItem?.product.name}
            </h4>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {firstItem?.quantity} barang
            </p>
            {additionalItemsCount > 0 && (
              <p className="font-body text-xs text-muted-foreground mt-2">
                + {additionalItemsCount} produk lainnya
              </p>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col md:items-end gap-3 border-t md:border-t-0 border-border pt-4 md:pt-0 mt-2 md:mt-0">
          <div>
            <p className="font-body text-xs text-muted-foreground md:text-right mb-1">Total Belanja</p>
            <p className="font-heading text-lg font-bold text-foreground">
              {formatPrice(Number(order.grandTotal))}
            </p>
          </div>
          <Link 
            href={`/orders/${order.id}`}
            className="w-full md:w-auto text-center px-6 py-2 bg-foreground text-background font-body text-[10px] tracking-[0.2em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}