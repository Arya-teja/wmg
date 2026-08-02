"use client";

import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { useInView } from "@/hooks/useInView";
import CollectionCard from "./CollectionCard";
import { Product } from "@/types";

export default function CollectionSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const { ref, isInView } = useInView();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productService.getAll();
        setProducts(data.slice(0, 3)); // Ambil  produk pertama
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-20">
        <div
          ref={ref}
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <span className="font-body text-xs uppercase tracking-[0.3em] text-accent">
            Koleksi Istimewa
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">
            Batik Modern Collection
          </h2>

          <p className="text-gray-600 mt-4">
            Interpretasi modern dari warisan batik Indonesi
            <br></br>dirancang untuk gaya hidup masa kini
          </p>

          {isLoading ? (
            <div className="mt-8 m-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-3/4 bg-muted rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <CollectionCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
