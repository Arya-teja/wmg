"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X, FileText } from "lucide-react";
import { useCart } from "@/context/CartContext";
export default function Navbar() {
  const { totalItems, lastAddedAnimation } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (lastAddedAnimation > 0) {
      setShowPlus(true);
      const t = setTimeout(() => setShowPlus(false), 800);
      return () => clearTimeout(t);
    }
  }, [lastAddedAnimation]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/catalog", label: "Katalog" },
    { href: "/orders", label: "Pesanan Saya" },
    { href: "/transactions", label: "Transaksi" },
    { href: "/review", label: "Review" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto px-20 flex items-center justify-between h-16 md:h-20">
        <Link
          href="/"
          className="font-heading text-2xl md:text-3xl font-bold tracking-wider text-foreground"
        >
          WMG
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-body font-medium tracking-wide uppercase transition-colors hover:text-accent ${
                pathname === l.href ? "text-accent" : "text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Cari"
            className="p-2 hover:text-accent transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link
            href="/cart"
            aria-label="Keranjang"
            className="relative p-2 hover:text-accent transition-colors"
          >
            <div
              className={lastAddedAnimation > 0 ? "animate-cart-bounce" : ""}
            >
              <ShoppingBag className="w-5 h-5" />
            </div>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
            {showPlus && (
              <span className="absolute -top-2 -right-2 text-accent font-bold text-sm pointer-events-none animate-float-up">
                +1
              </span>
            )}
          </Link>
          <Link
            href="/transactions"
            aria-label="Transaksi"
            className="hidden md:block p-2 hover:text-accent transition-colors"
          >
            <FileText className="w-5 h-5" />
          </Link>
          <button
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden overflow-hidden bg-background border-t border-border animate-fade-in">
          <div className="container  mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-body font-medium tracking-wide uppercase py-2 ${
                  pathname === l.href ? "text-accent" : "text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
