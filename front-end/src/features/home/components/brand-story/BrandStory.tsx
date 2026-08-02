import { useInView } from "@/hooks/useInView";
import Image from "next/image";
import Link from "next/link";

const brandStories = [
  { name: "Pria", image: "/images/pria.png", harga: "Rp 199.000" },
];

export default function BrandStory() {
  const { ref: imageRef, isInView: imageInView } = useInView();
  const { ref: textRef, isInView: textInView } = useInView();

  return (
    <section className="py-20 md:py-15">
      <div className="container mx-auto px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            ref={imageRef}
            className={`relative transition-all duration-700 ${
              imageInView
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="absolute -inset-3 border border-accent/15 rounded" />
            <Image
              src={brandStories[0].image}
              alt={brandStories[0].name}
              width={1024}
              height={768}
              className="w-full rounded object-cover aspect-4/3"
            />
          </div>

          <div
            ref={textRef}
            className={`transition-all duration-700 ${
              textInView
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-accent">
              Cerita Kami
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-6">
              Dari Canting ke Runways
            </h2>
            <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
              <p>
                WMG lahir dari kecintaan terhadap warisan tekstil Indonesia.
                Kami percaya bahwa batik bukan sekadar kain — ia adalah cerita,
                identitas, dan kebanggaan yang layak dikenakan setiap hari.
                <br />
                <br />
                Setiap koleksi kami didesain di Yogyakarta, dikerjakan oleh
                tangan-tangan terampil pengrajin batik, menggunakan material
                premium yang nyaman dan tahan lama.
                <br />
                <br />
                Kami menciptakan fashion yang timeless — perpaduan tradisi dan
                modernitas yang tidak lekang oleh waktu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
