'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const { items, totalAmount, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-6" />
        <h1 className="font-heading text-2xl tracking-wide text-foreground mb-2">
          Keranjang Kosong
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Belum ada produk yang ditambahkan ke keranjang.
        </p>
        <button
          onClick={() => router.push('/catalog')}
          className="px-8 py-3 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl tracking-wide text-foreground mb-10">
        Keranjang Belanja
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Daftar Produk */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => {
            return (
              <div
                key={item.id} // <-- Sekarang cukup pakai item.id
                className="flex gap-5 pb-6 border-b border-border"
              >
                {/* Gambar */}
                <div className="relative w-24 h-28 sm:w-28 sm:h-32 flex-shrink-0 bg-muted">
                  <Image
                    src={item.product?.imageUrl || '/placeholder.jpg'} // <-- Diubah
                    alt={item.product?.name || 'Gambar Produk'} // <-- INI YANG BIKIN ERROR SEBELUMNYA
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Detail */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-heading text-sm tracking-wide text-foreground">
                        {item.product?.name} {/* <-- Diubah */}
                      </h3>
                      {(item.size || item.color) && (
                        <p className="font-body text-[11px] text-muted-foreground mt-1">
                          {[item.size, item.color].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)} // <-- Diubah
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="inline-flex items-center border border-border">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1)) // <-- Diubah
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-body text-xs tracking-wider w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} // <-- Diubah
                        className="w-8 h-8 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Harga */}
                    <p className="font-body text-sm font-medium text-foreground">
                      {formatPrice(Number(item.product?.price || 0) * item.quantity)} {/* <-- Diubah */}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ringkasan Belanja */}
        <div className="lg:col-span-1">
          <div className="border border-border p-6">
            <h2 className="font-heading text-sm tracking-wide text-foreground mb-6">
              Ringkasan Belanja
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-body text-sm text-foreground">
                <span>Total Harga</span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}