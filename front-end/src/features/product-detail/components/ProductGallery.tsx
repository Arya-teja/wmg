'use client';

import { useState } from 'react';
import Image from 'next/image';
import BatikSVGPattern from '@/components/decorative/BatikSVGPattern';

interface ProductGalleryProps {
  images?: { url: string }[];
  productName: string;
  imageUrl?: string;
}

export default function ProductGallery({ images, productName, imageUrl }: ProductGalleryProps) {
  const [activeImg, setActiveImg] = useState(0);

  const defaultFallback =
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60';

  // Ekstrak list gambar dengan aman dari images[] atau imageUrl tunggal
  const rawImages =
    images && images.length > 0
      ? images.map((img) => img.url)
      : imageUrl
        ? [imageUrl]
        : [defaultFallback];

  // Buat minimal 3 item untuk kebutuhan layout thumbnail vertikal editorial
  const gallery =
    rawImages.length >= 3 ? rawImages : [rawImages[0], rawImages[0], rawImages[0]];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 h-full">
      {/* Thumbnail Column */}
      <aside className="hidden lg:flex lg:col-span-2 flex-col items-center gap-3 pt-4 pl-4">
        {gallery.map((url, i) => (
          <button
            key={i}
            onClick={() => setActiveImg(i)}
            className={`relative w-16 aspect-[3/4] overflow-hidden border transition-colors ${
              activeImg === i
                ? 'border-foreground'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={url}
              alt={`${productName} thumbnail ${i + 1}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </aside>

      {/* Main Image */}
      <div className="lg:col-span-10 relative overflow-hidden bg-secondary w-full aspect-[4/5] lg:aspect-[3/4]">
        <Image
          src={gallery[activeImg]}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-opacity duration-500"
        />
        <BatikSVGPattern
          className="absolute -bottom-8 -right-8 w-48 h-48 text-batik-gold pointer-events-none"
          opacity={0.3}
        />
      </div>
    </div>
  );
}