import Image from "next/image";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
}

export default function CategoryCard({ name, image, href }: CategoryCardProps) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <Link
        href={href}
        className="group relative block aspect-3/4 overflow-hidden rounded"
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/20 to-transparent" />
        <div className="absolute inset-0 border border-transparent group-hover:border-accent/40 rounded transition-all duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-heading text-lg font-semibold text-primary-foreground group-hover:text-accent transition-colors">
            {name}
          </h3>
        </div>
      </Link>
    </div>
  );
}
