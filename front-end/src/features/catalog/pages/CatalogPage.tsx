"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import CatalogHero from "@/features/catalog/components/CatalogHero";
import FilterBar, { SortKey } from "@/features/catalog/components/FilterBar";
import CatalogProductCard from "@/features/catalog/components/CatalogProductCard";
import MobileFilterPanel from "@/features/catalog/components/MobileFilterPanel";
import { productService } from "@/services/product.service";
import { Product } from "@/types";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sort, setSort] = useState<SortKey>("Terbaru");
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await productService.getAll();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Gagal memuat katalog produk. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category?.name).filter(Boolean)),
    ) as string[];
    return ["Semua", ...unique];
  }, [products]);

  const filtered = useMemo(() => {
    let list =
      activeCategory === "Semua"
        ? products
        : products.filter((p) => p.category?.name === activeCategory);

    if (sort === "Harga: Rendah")
      list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "Harga: Tinggi")
      list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [products, activeCategory, sort]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-batik-gold" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 font-body text-sm tracking-[0.2em] uppercase mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="font-body text-[11px] tracking-[0.25em] uppercase bg-foreground text-background px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CatalogHero totalProducts={products.length} />

      <FilterBar
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        sort={sort}
        setSort={setSort}
        onOpenPanel={() => setPanelOpen(true)}
        count={filtered.length}
      />

      <section className="py-14 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10 md:mb-16">
            <div>
              <p className="font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
                Koleksi · {activeCategory}
              </p>
              <h2 className="font-heading text-3xl md:text-5xl uppercase tracking-tight">
                Selected Pieces
              </h2>
            </div>
            <span className="hidden md:block font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {filtered.length.toString().padStart(2, "0")} /{" "}
              {products.length.toString().padStart(2, "0")}
            </span>
          </div>

          {/* Product Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-14 md:gap-y-20">
              {filtered.map((product, index) => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  large={index % 7 === 0}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-20 font-body text-sm tracking-[0.2em] uppercase text-muted-foreground">
              Tidak ada produk pada kategori ini.
            </p>
          )}
        </div>
      </section>

      {/* Mobile Filter Panel */}
      <MobileFilterPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        sort={sort}
        setSort={setSort}
      />
    </div>
  );
}