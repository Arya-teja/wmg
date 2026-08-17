"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Loader2, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/types";
import { orderService } from "@/services/order.service";
import {
  voucherService,
  ValidateVoucherResponse,
  Voucher,
} from "@/services/voucher.service";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, refreshCart } = useCart();

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] =
    useState<ValidateVoucherResponse | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      setIsLoadingVouchers(true);
      try {
        const vouchers = await voucherService.getAll();
        setAvailableVouchers(vouchers);
      } catch {
        setAvailableVouchers([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    };

    fetchVouchers();
  }, []);

  const eligibleVouchers = useMemo(() => {
    const now = new Date();
    return availableVouchers.filter(
      (voucher) =>
        voucher.quota > 0 &&
        new Date(voucher.expiresAt) > now &&
        totalAmount >= Number(voucher.minPurchaseAmount),
    );
  }, [availableVouchers, totalAmount]);

  const handleSelectVoucher = async (code: string) => {
    setVoucherCode(code);
    setShowVoucherList(false);
    await handleApplyVoucher();
  };

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
        ...(appliedVoucher ? { voucherId: appliedVoucher.voucher.id } : {}),
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

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;

    setIsValidatingVoucher(true);
    setVoucherError("");

    try {
      const result = await voucherService.validateVoucher(
        voucherCode.trim(),
        totalAmount,
      );
      setAppliedVoucher(result);
      setVoucherCode("");
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        "Gagal memvalidasi voucher. Silakan coba lagi.";
      setVoucherError(message);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
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
                        src={
                          item.product?.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60"
                        }
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

              {/* Voucher */}
              <div className="border-t border-border pt-4 mb-6">
                {appliedVoucher ? (
                  <div className="flex items-center justify-between gap-3 bg-muted px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-body text-xs font-medium text-foreground truncate">
                        {appliedVoucher.voucher.code}
                      </span>
                      <span className="font-body text-[11px] text-muted-foreground">
                        ({formatPrice(appliedVoucher.discount)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      aria-label="Hapus voucher"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Masukkan kode voucher"
                        className="flex-1 min-w-0 px-4 py-3 border border-border bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                        disabled={isValidatingVoucher || isLoading}
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={isValidatingVoucher || isLoading}
                        className="px-5 border border-foreground font-body text-[11px] tracking-[0.2em] uppercase text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-shrink-0"
                      >
                        {isValidatingVoucher ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Terapkan"
                        )}
                      </button>
                    </div>
                    {voucherError && (
                      <p className="font-body text-xs text-red-500 mt-2">
                        {voucherError}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowVoucherList((prev) => !prev)}
                      className="mt-3 flex items-center gap-1 font-body text-[11px] tracking-wider text-muted-foreground hover:text-foreground transition-colors uppercase"
                    >
                      Lihat voucher tersedia
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          showVoucherList ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {showVoucherList && (
                      <div className="mt-3 border border-border">
                        {isLoadingVouchers ? (
                          <div className="px-4 py-3">
                            <p className="font-body text-xs text-muted-foreground">
                              Memuat voucher...
                            </p>
                          </div>
                        ) : eligibleVouchers.length === 0 ? (
                          <div className="px-4 py-3">
                            <p className="font-body text-xs text-muted-foreground">
                              Belum ada voucher yang bisa digunakan untuk
                              belanja ini
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-border">
                            {eligibleVouchers.map((voucher) => (
                              <button
                                key={voucher.id}
                                type="button"
                                onClick={() =>
                                  handleSelectVoucher(voucher.code)
                                }
                                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors"
                              >
                                <p className="font-body text-xs font-medium text-foreground">
                                  {voucher.code}
                                </p>
                                {voucher.description && (
                                  <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                                    {voucher.description}
                                  </p>
                                )}
                                <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                                  {voucher.discountType === "PERCENTAGE"
                                    ? `Diskon ${Number(voucher.discountValue)}%`
                                    : `Potongan ${formatPrice(
                                        Number(voucher.discountValue),
                                      )}`}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between font-body text-sm text-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between font-body text-sm text-foreground">
                      <span>Diskon</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(appliedVoucher.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-body text-sm text-foreground border-t border-border pt-3">
                    <span>Total Harga</span>
                    <span className="font-medium">
                      {formatPrice(
                        appliedVoucher
                          ? totalAmount - appliedVoucher.discount
                          : totalAmount,
                      )}
                    </span>
                  </div>
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
