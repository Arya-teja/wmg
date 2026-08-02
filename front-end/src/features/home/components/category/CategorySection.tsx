'use client';

import CategoryCard from './CategoryCard';
import { useInView } from '@/hooks/useInView';

const categories = [
  { name: 'Pria', image: '/images/pria.png' },
  { name: 'Wanita', image: '/images/wanita.png' },
  { name: 'Batik Modern', image: '/images/batik.png' },
  { name: 'Essential Wear', image: '/images/wanita.png' },
  { name: 'New Arrival', image: '/images/pria.png' },
]

export default function CategorySection() {
  const { ref: headerRef, isInView: headerInView } = useInView();

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} name={cat.name} image={cat.image} />
          ))}
        </div>
      </div>
    </section>
  );
}

