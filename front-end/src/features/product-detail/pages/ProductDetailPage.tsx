"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { productService } from "@/services/product.service";
import { Product, formatPrice } from "@/types";
import ProductGallery from "@/features/product-detail/components/ProductGallery";
import AddToCartForm from "@/features/product-detail/components/AddToCartForm";
import BatikSVGPattern from "@/components/decorative/BatikSVGPattern";

interface ProductDetailPageProps {
  slug: string;
}

export default function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getBySlug(slug);
        setProduct(data);
      } catch (err) {
        console.error("Error loading product detail:", err);
        setError("Gagal memuat detail produk. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-batik-gold" />
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 font-body text-sm tracking-[0.2em] uppercase mb-4">
            {error || "Produk tidak ditemukan."}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="font-body text-[11px] tracking-[0.25em] uppercase border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              Kembali
            </button>
            <button
              onClick={() => window.location.reload()}
              className="font-body text-[11px] tracking-[0.25em] uppercase bg-foreground text-background px-6 py-3 hover:opacity-90 transition-opacity"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 md:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </button>
      </div>

      {/* Product Detail Section */}
      <section className="container mx-auto px-4 md:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Gallery - Left Side */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              imageUrl={product.imageUrl ?? undefined}
              productName={product.name}
            />
          </div>

          {/* Product Info - Right Side */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
              <Link
                href="/catalog"
                className="hover:text-foreground transition-colors"
              >
                Katalog
              </Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>

            {/* Title & Price */}
            <div className="border-b border-border pb-6">
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline justify-between mt-4">
                <p className="font-heading text-2xl md:text-3xl text-foreground">
                  {formatPrice(product.price)}
                </p>
                {(() => {
                  const totalStock =
                    product.sizeStocks?.reduce(
                      (a, b) => a + (b.stock ?? 0),
                      0,
                    ) ?? 0;
                  return totalStock > 0 ? (
                    <span className="font-body text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                      Stok: {totalStock}
                    </span>
                  ) : (
                    <span className="font-body text-[9px] tracking-[0.3em] uppercase text-red-500">
                      Habis
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b border-border">
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
              {product.category && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Kategori:
                  </span>
                  <Link
                    href={`/catalog?category=${product.category.slug}`}
                    className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground hover:text-batik-gold transition-colors underline underline-offset-4"
                  >
                    {product.category.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Add to Cart Form */}
            <AddToCartForm product={product} />
          </div>
        </div>
      </section>

      {/* Batik Ornament Footer */}
      <div className="relative h-32 md:h-48 overflow-hidden bg-secondary/30">
        <BatikSVGPattern
          className="absolute inset-0 w-full h-full text-batik-gold"
          opacity={0.15}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-heading italic text-lg md:text-2xl text-muted-foreground/40 tracking-wider">
            &ldquo;Warisan yang dikenakan, bukan dipajang.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
