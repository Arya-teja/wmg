'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Order, formatPrice } from '@/types';
import { orderService } from '@/services/order.service';
import OrderStatusBadge from '../components/OrderStatusBadge';

interface OrderDetailPageProps {
  id: string;
}

export default function OrderDetailPage({ id }: OrderDetailPageProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error('Gagal mengambil detail pesanan:', error);
        router.push('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (isLoading) {
    return (
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="h-8 w-48 bg-muted animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[500px] bg-muted animate-pulse" />
            <div className="h-[300px] bg-muted animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!order) return null;

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(order.createdAt));

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Riwayat Pesanan
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl tracking-wide text-foreground">
              Detail Pesanan
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              ID Pesanan: <span className="font-medium text-foreground">{order.id}</span>
            </p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Tanggal: {formattedDate} WIB
            </p>
          </div>
          <div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Daftar Produk */}
            <div className="border border-border p-6 bg-background">
              <h2 className="font-heading text-lg text-foreground mb-6 pb-4 border-b border-border">
                Daftar Produk
              </h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-muted flex-shrink-0">
                      <Image
                        src={item.product.imageUrl || '/placeholder.jpg'}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 640px) 80px, 96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-heading text-sm text-foreground line-clamp-2">
                          {item.product.name}
                        </h3>
                        {(item.size || item.color) && (
                          <p className="font-body text-[11px] text-muted-foreground mt-1">
                            {[item.size, item.color].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          {item.quantity} x {formatPrice(Number(item.price))}
                        </p>
                      </div>
                      <p className="font-body text-sm font-medium text-foreground text-right mt-2">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Pengiriman */}
            <div className="border border-border p-6 bg-background">
              <h2 className="font-heading text-lg text-foreground mb-6 pb-4 border-b border-border">
                Informasi Pengiriman
              </h2>
              <div className="space-y-4 font-body text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Nama Penerima</p>
                  <p className="font-medium text-foreground">{order.recipientName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Nomor Telepon</p>
                  <p className="font-medium text-foreground">{order.recipientPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Alamat Pengiriman</p>
                  <p className="text-foreground leading-relaxed">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Ringkasan Pembayaran */}
            <div className="border border-border p-6 bg-background sticky top-24">
              <h2 className="font-heading text-lg text-foreground mb-6 pb-4 border-b border-border">
                Ringkasan Pembayaran
              </h2>
              
              <div className="space-y-3 font-body text-sm mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode Pembayaran</span>
                  <span className="font-medium">{order.payment?.provider || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Harga</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
                {Number(order.discountTotal) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon Voucher</span>
                    <span>-{formatPrice(Number(order.discountTotal))}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-heading text-sm">Total Belanja</span>
                <span className="font-heading text-lg font-bold text-foreground">
                  {formatPrice(Number(order.grandTotal))}
                </span>
              </div>

              {order.payment?.status === 'PENDING' && order.payment?.paymentUrl && (
                <button
                  onClick={() => window.location.href = order.payment!.paymentUrl!}
                  className="w-full py-4 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300"
                >
                  Lanjutkan Pembayaran
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}