"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

interface AddToCartFormProps {
  product: Product;
}

export default function AddToCartForm({ product }: AddToCartFormProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const validateSelection = (): boolean => {
    if (product.sizeStocks?.length > 0 && !selectedSize) {
      toast.error("Pilih ukuran terlebih dahulu");
      return false;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Pilih warna terlebih dahulu"); // BERUBAH DI SINI
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateSelection()) return;
    try {
      await addItem({
        productId: product.id,
        quantity: quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } catch (err) {
      const message =
        (err as any)?.response?.data?.message ||
        "Gagal menambahkan ke keranjang. Silakan coba lagi.";
      toast.error(message);
    }
  };

  const handleBuyNow = async () => {
    if (!validateSelection()) return;
    try {
      await addItem({
        productId: product.id,
        quantity: quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
      router.push("/cart");
    } catch (err) {
      const message =
        (err as any)?.response?.data?.message ||
        "Gagal memproses pesanan. Silakan coba lagi.";
      toast.error(message);
    }
  };

  return (
    <div className="mt-8">
      {/* Size Selector */}
      {product.sizeStocks?.length > 0 && (
        <div className="mb-8">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground mb-4">
            Ukuran
          </p>
          <div className="grid grid-cols-5 gap-2">
            {product.sizeStocks.map((s) => (
              <button
                key={s.size}
                onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                disabled={s.stock <= 0}
                className={`py-3 font-body text-[11px] tracking-[0.15em] uppercase border transition-all ${
                  selectedSize === s.size
                    ? "bg-foreground text-background border-foreground"
                    : s.stock <= 0
                      ? "border-border text-muted-foreground cursor-not-allowed opacity-50"
                      : "border-border hover:border-foreground"
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {product.colors?.length > 0 && (
        <div className="mb-8">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground mb-4">
            Warna{" "}
            {selectedColor && (
              <span className="text-muted-foreground">· {selectedColor}</span>
            )}
          </p>
          <div className="flex gap-3">
            {product.colors.map((c: { name: string; hex: string }) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.name)}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`relative w-9 h-9 rounded-none border transition-all ${
                  selectedColor === c.name
                    ? "border-foreground ring-1 ring-offset-2 ring-offset-background ring-foreground"
                    : "border-border hover:border-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="mb-10">
        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground mb-4">
          Jumlah
        </p>
        <div className="inline-flex items-center border border-border">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-11 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-body text-sm tracking-wider w-10 text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-11 h-11 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          className="w-full py-4 bg-foreground text-background font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-background hover:text-foreground transition-colors duration-300"
        >
          Tambahkan ke Keranjang
        </button>
        <button
          onClick={handleBuyNow}
          className="w-full py-4 bg-background text-foreground font-body text-[11px] tracking-[0.3em] uppercase border border-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
