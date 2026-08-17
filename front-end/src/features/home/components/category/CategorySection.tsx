'use client';

import { useEffect, useState } from 'react';
import { categoryService, Category } from '@/services/category.service';
import CategoryCard from './CategoryCard';
import { useInView } from '@/hooks/useInView';

const CATEGORY_FALLBACK_IMAGE = '/images/batik.png';

export default function CategorySection() {
  const { ref: headerRef, isInView: headerInView } = useInView();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (!isLoading && categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-15">
      <div className="container mx-auto px-20">
        <div
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <span className="font-body text-xs uppercase tracking-[0.3em] text-accent">
            Eksplorasi
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">
            Kategori Pilihan
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-3/4 bg-muted rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                image={category.imageUrl ?? CATEGORY_FALLBACK_IMAGE}
                href={`/catalog?category=${encodeURIComponent(category.slug)}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

