import type { Metadata } from "next";
import CartPage from "@/features/cart/pages/CartPage";

export const metadata: Metadata = {
  title: "Keranjang Belanja | WMG",
};

export default function Page() {
  return <CartPage />;
}