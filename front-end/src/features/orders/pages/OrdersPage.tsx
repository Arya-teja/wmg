'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { Order } from '@/types';
import { orderService } from '@/services/order.service';
import OrderCard from '../components/OrderCard';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Gagal mengambil data pesanan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-heading text-3xl tracking-wide text-foreground mb-10">
          Riwayat Pesanan
        </h1>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 border border-border p-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-6" />
            <h2 className="font-heading text-2xl tracking-wide text-foreground mb-2">
              Belum Ada Pesanan
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-8 text-center">
              Anda belum melakukan pemesanan apa pun. Mulai jelajahi koleksi kami.
            </p>
            <button
              onClick={() => router.push('/catalog')}
              className="px-8 py-3 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}