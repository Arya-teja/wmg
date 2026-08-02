"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Product, formatPrice } from "@/types/index";

interface CatalogProductCardProps {
  product: Product;
  index: number;
  large?: boolean;
}

export default function CatalogProductCard({
  product,
  index,
  large,
}: CatalogProductCardProps) {
  const { ref, isInView } = useInView(0.1);

  // Pengaman Ganda: Cek images array -> Cek imageUrl string -> Fallback ke gambar online yang valid
  const fallbackImage =
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60";
  const primaryImg =
    product.images?.[0]?.url || product.imageUrl || fallbackImage;
  const secondaryImg = product.images?.[1]?.url || primaryImg;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 6) * 80}ms` }}
      className={`transition-all duration-700 ease-out ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${large ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div
          className={`relative overflow-hidden bg-secondary ${
            large ? "aspect-[4/5]" : "aspect-[3/4]"
          }`}
        >
          {/* Primary Image */}
          <Image
            src={primaryImg}
            alt={product.name}
            fill
            sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
            className="object-cover transition-opacity duration-700 group-hover:opacity-0"
          />
          {/* Secondary Image on Hover */}
          <Image
            src={secondaryImg}
            alt={`${product.name} alternate`}
            fill
            sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
            className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 scale-105"
          />
          {product.label && (
            <span className="absolute top-3 left-3 bg-background/90 text-foreground text-[9px] font-body font-semibold uppercase tracking-[0.25em] px-2.5 py-1">
              {product.label}
            </span>
          )}
          {/* Hover Effect Detail Product  */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <div className="flex items-center justify-between bg-background/95 backdrop-blur px-3 py-2">
              <span className="font-body text-[10px] tracking-[0.25em] uppercase">
                Lihat Detail
              </span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
        {/* Product Info */}
        <div className="pt-4 pb-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-body text-[12px] tracking-[0.15em] uppercase text-foreground line-clamp-1">
              {product.name}
            </h3>
            <p className="font-body text-[12px] tracking-wider whitespace-nowrap">
              {formatPrice(product.price)}
            </p>
          </div>
          {product.category && (
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
              {product.category.name}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
