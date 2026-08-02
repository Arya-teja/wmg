"use client";

import Image from "next/image";
import BatikSVGPattern from "@/components/decorative/BatikSVGPattern";
import { useInView } from "@/hooks/useInView";

export default function CatalogHero({
  totalProducts,
}: {
  totalProducts: number;
}) {
  const { ref, isInView } = useInView(0.1);

  return (
    <section className="relative w-full">
      <div className="grid grid-cols-2 md:grid-cols-12 min-h-[70vh] md:min-h-[85vh]">
        <div className="relative md:col-span-7 overflow-hidden bg-batik-navy">
          <div
            ref={ref}
            className={`absolute inset-0 transition-all duration-1400ms ease-out ${
              isInView ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
          >
            <Image
              src="/images/pria.png"
              alt="WMG Editorial"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-batik-navy/70 via-transparent to-transparent" />
          <BatikSVGPattern
            className="absolute -top-6 -right-6 w-56 h-56 text-batik-gold"
            opacity={0.35}
          />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex items-end justify-between">
            <div>
              <p className="font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-batik-gold mb-3">
                Spring / Summer · Edition 01
              </p>
              <h1 className="font-heading text-primary-foreground text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] uppercase tracking-tight">
                The
                <br />
                <span className="italic font-light">Lookbook</span>
              </h1>
            </div>
            <div className="hidden md:block text-primary-foreground/70 font-body text-xs tracking-[0.3em] uppercase [writing-mode:vertical-rl]">
              Nº 2026
            </div>
          </div>
        </div>

        <div className="relative md:col-span-5 bg-secondary flex flex-col justify-between p-6 md:p-12">
          <div className="flex items-center justify-between">
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
              WMG / Katalog
            </span>
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
              {totalProducts} Pieces
            </span>
          </div>

          <div className="relative w-full aspect-[4/5]">
            <Image
              src="/images/wanita.png"
              alt="Campaign"
              fill
              className="object-cover"
            />
            <BatikSVGPattern
              className="absolute -bottom-4 -left-4 w-28 h-28 text-batik-brown"
              opacity={0.5}
            />
          </div>

          <div>
            <p className="font-heading italic text-2xl md:text-3xl leading-tight mb-6 max-w-sm">
              &ldquo;Warisan yang dikenakan, bukan dipajang.&rdquo;
            </p>
            <div className="flex items-center gap-2 font-body text-xs tracking-[0.3em] uppercase">
              <span className="h-px w-10 bg-foreground" />
              Jelajahi Koleksi
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}