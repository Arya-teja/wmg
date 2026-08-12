import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import { SiteChrome } from "@/components/layout/SiteChrome";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WMG - Warisan Nusantara, Gaya Modern",
  description:
    "Fashion modern Indonesia dengan akar budaya batik. Premium, timeless, berani.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn(
        "h-full antialiased",
        playfairDisplay.variable,
        plusJakartaSans.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
