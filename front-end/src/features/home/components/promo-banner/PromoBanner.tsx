"use client";

import Link from "next/link";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";
import BatikSVGPattern from "@/components/decorative/BatikSVGPattern";

export default function PromoBannerSection() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <Image
        src="/images/wanita.png"
        alt="WMG Campaign"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 batik-overlay" />
      <BatikSVGPattern
        className="absolute inset-0 text-accent"
        opacity={0.08}
      />

      <div
        ref={ref}
        className={`relative container mx-auto px-4 text-center transition-all duration-700 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <span className="font-body text-xs uppercase tracking-[0.3em] text-accent">
          Campaign 2026
        </span>
        <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mt-4 mb-4">
          Batik for Everyday
          <br />
          <span className="text-gradient-gold">Modern Living</span>
        </h2>
        <p className="font-body text-primary-foreground/70 max-w-md mx-auto mb-8">
          Temukan koleksi yang menghadirkan keindahan batik ke dalam setiap
          momen keseharian Anda.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center px-8 py-3.5 bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-wider rounded hover:bg-accent/90 transition-all hover-batik-glow"
        >
          Jelajahi Koleksi
        </Link>
      </div>
    </section>
  );
}
