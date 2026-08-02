"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/types";
import { orderService } from "@/services/order.service";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, refreshCart } = useCart();

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-6" />
        <h1 className="font-heading text-2xl tracking-wide text-foreground mb-2">
          Keranjang Kosong
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Tidak ada item untuk di-checkout. Silakan tambahkan produk terlebih
          dahulu.
        </p>
        <button
          onClick={() => router.push("/catalog")}
          className="px-8 py-3 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !recipientName.trim() ||
      !recipientPhone.trim() ||
      !shippingAddress.trim()
    ) {
      toast.error("Semua field harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      const order = await orderService.createOrder({
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        shippingAddress: shippingAddress.trim(),
      });

      toast.success("Pesanan berhasil dibuat!");

      refreshCart();

      if (order.payment?.paymentUrl) {
        window.location.href = order.payment.paymentUrl;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal membuat pesanan. Silakan coba lagi.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <h1 className="font-heading text-3xl tracking-wide text-foreground mb-10">
        Checkout
      </h1>

      <form onSubmit={handleCheckout}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form Informasi Pengiriman */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="font-heading text-sm tracking-wide text-foreground mb-6">
              Informasi Pengiriman
            </h2>

            <div>
              <label
                htmlFor="recipientName"
                className="block font-body text-xs tracking-wider text-muted-foreground mb-2 uppercase"
              >
                Nama Penerima
              </label>
              <input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Masukkan nama lengkap penerima"
                className="w-full px-4 py-3 border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="recipientPhone"
                className="block font-body text-xs tracking-wider text-muted-foreground mb-2 uppercase"
              >
                No. Handphone
              </label>
              <input
                id="recipientPhone"
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-4 py-3 border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="shippingAddress"
                className="block font-body text-xs tracking-wider text-muted-foreground mb-2 uppercase"
              >
                Alamat Pengiriman Lengkap
              </label>
              <textarea
                id="shippingAddress"
                rows={4}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap (jalan, kota, provinsi, kode pos)"
                className="w-full px-4 py-3 border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="lg:col-span-2">
            <div className="border border-border p-6">
              <h2 className="font-heading text-sm tracking-wide text-foreground mb-6">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-20 flex-shrink-0 bg-muted">
                      <Image
                        src={item.product?.imageUrl || "/placeholder.jpg"}
                        alt={item.product?.name || "Gambar Produk"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-xs tracking-wide text-foreground truncate">
                        {item.product?.name}
                      </h3>
                      {(item.size || item.color) && (
                        <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-body text-[11px] text-muted-foreground">
                          x{item.quantity}
                        </span>
                        <span className="font-body text-xs font-medium text-foreground">
                          {formatPrice(
                            Number(item.product?.price || 0) * item.quantity,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between font-body text-sm text-foreground">
                  <span>Total Harga</span>
                  <span className="font-medium">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Buat Pesanan"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
