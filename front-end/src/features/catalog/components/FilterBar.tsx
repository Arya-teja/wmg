"use client";

import { SlidersHorizontal } from "lucide-react";

export const sortOptions = [
  "Terbaru",
  "Harga: Rendah",
  "Harga: Tinggi",
] as const;
export type SortKey = (typeof sortOptions)[number];

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  sort: SortKey;
  setSort: (key: SortKey) => void;
  onOpenPanel: () => void;
  count: number;
}

export default function FilterBar({
  categories,
  activeCategory,
  setActiveCategory,
  sort,
  setSort,
  onOpenPanel,
  count,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-y border-border">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-6">
        <div className="hidden md:flex items-center gap-6 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`relative font-body text-[11px] tracking-[0.25em] uppercase whitespace-nowrap py-1 transition-colors ${
                activeCategory === c
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
              {activeCategory === c && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-foreground" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenPanel}
          className="md:hidden flex items-center gap-2 font-body text-[11px] tracking-[0.25em] uppercase"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
        </button>

        <div className="flex items-center gap-6">
          <span className="hidden md:inline font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            {count} Items
          </span>
          <div className="relative group">
            <button className="font-body text-[11px] tracking-[0.25em] uppercase text-foreground">
              Urut · {sort}
            </button>
            <div className="absolute right-0 top-full mt-2 bg-background border border-border py-2 min-w-45 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {sortOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`block w-full text-left px-4 py-2 font-body text-[11px] tracking-[0.2em] uppercase hover:bg-secondary ${
                    sort === s ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
