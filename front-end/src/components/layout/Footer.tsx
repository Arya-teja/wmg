import Link from 'next/link';
import { AtSign, MapPin, Phone, Mail } from 'lucide-react';
import BatikSVGPattern from '@/components/decorative/BatikSVGPattern';

const navigationLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/catalog', label: 'Katalog' },
  { href: '/cart', label: 'Keranjang' },
  { href: '/transactions', label: 'Transaksi' },
  {href: '/review', label: 'Ulasan'},
];

const categoryLinks = [
  { href: '/catalog', label: 'Pria' },
  { href: '/catalog', label: 'Wanita' },
  { href: '/catalog', label: 'Batik Modern' },
  { href: '/catalog', label: 'Essential Wear' },
  { href: '/catalog', label: 'New Arrivals' },
];

export default function Footer() {
  return (
    <footer className="relative bg-primary text-primary-foreground overflow-hidden">
      <BatikSVGPattern className="absolute inset-0 text-accent" opacity={0.06} />

      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-3xl font-bold mb-3">WMG</h3>
            <p className="text-sm opacity-70 font-body leading-relaxed">
              Fashion modern Indonesia dengan akar budaya batik. Premium, timeless, berani.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-heading text-sm uppercase tracking-widest mb-4 opacity-80">
              Navigasi
            </h4>
            <div className="flex flex-col gap-2 text-sm font-body opacity-70">
              {navigationLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:opacity-100 hover:text-accent transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="font-heading text-sm uppercase tracking-widest mb-4 opacity-80">
              Kategori
            </h4>
            <div className="flex flex-col gap-2 text-sm font-body opacity-70">
              {categoryLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="hover:opacity-100 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-heading text-sm uppercase tracking-widest mb-4 opacity-80">
              Kontak
            </h4>
            <div className="flex flex-col gap-3 text-sm font-body opacity-70">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Yogyakarta, Indonesia
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +62 812-xxxx-xxxx
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> hello@wmg.id
              </span>
              <span className="flex items-center gap-2">
                <AtSign className="w-4 h-4" /> @wmg.official
              </span>
            </div>
          </div>
        </div>

        <div className="batik-divider mt-12 mb-6" />
        <p className="text-center text-xs opacity-50 font-body">
          © 2026 WMG. All rights reserved.
        </p>
      </div>
    </footer>
  );
}