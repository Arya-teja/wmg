'use client';

import { X } from 'lucide-react';
import { sortOptions, SortKey } from './FilterBar';

interface MobileFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
}

export default function MobileFilterPanel({
  isOpen,
  onClose,
  categories,
  activeCategory,
  setActiveCategory,
  sort,
  setSort,
}: MobileFilterPanelProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-[85%] max-w-sm bg-background md:hidden flex flex-col transition-transform duration-400 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <span className="font-body text-[11px] tracking-[0.3em] uppercase">Filter</span>
          <button onClick={onClose} aria-label="Tutup filter">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Kategori
            </p>
            <div className="space-y-3">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setActiveCategory(c);
                    onClose();
                  }}
                  className={`block w-full text-left font-body text-sm tracking-[0.15em] uppercase pb-2 border-b transition-colors ${
                    activeCategory === c
                      ? 'text-foreground border-foreground'
                      : 'text-muted-foreground border-border'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Urutkan
            </p>
            <div className="space-y-3">
              {sortOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    onClose();
                  }}
                  className={`block w-full text-left font-body text-sm tracking-[0.15em] uppercase pb-2 border-b transition-colors ${
                    sort === s ? 'text-foreground border-foreground' : 'text-muted-foreground border-border'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}