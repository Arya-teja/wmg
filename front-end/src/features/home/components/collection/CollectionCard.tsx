"use client";

import Image from "next/image";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { Product, formatPrice } from "@/types";

interface CollectionCardProps {
  product: Product;
}

const LABEL_TEXT: Record<string, string> = {
  BEST_SELLER: "Best Seller",
  NEW_ARRIVAL: "New Arrival",
};

export default function CollectionCard({ product }: CollectionCardProps) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="group relative block aspect-3/4 overflow-hidden rounded">
          <Image
            src={product.images?.[0]?.url || "/images/pria.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/70 via-primary/20 to-transparent" />
          <div className="absolute inset-0 border border-transparent group-hover:border-accent/40 rounded transition-all duration-300" />
          {product.label && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1 rounded">
              {LABEL_TEXT[product.label]}
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-heading text-lg font-semibold text-primary-foreground group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <p className="font-body text-sm font-bold text-primary-foreground group-hover:text-accent transition-colors">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
