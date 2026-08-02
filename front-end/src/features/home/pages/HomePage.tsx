"use client";
import CategorySection from "@/features/home/components/category/CategorySection";
import CollectionSection from "@/features/home/components/collection/CollectionSection";
import BrandStory from "@/features/home/components/brand-story/BrandStory";
import PromoBanner from "@/features/home/components/promo-banner/PromoBanner";

export default function HomePage() {
  return (
    <main>
      <CategorySection />
      <CollectionSection />
      <BrandStory />
      <PromoBanner />
    </main>
  );
}
