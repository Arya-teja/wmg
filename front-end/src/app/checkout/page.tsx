import type { Metadata } from "next";
import CheckoutPage from "@/features/checkout/pages/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | WMG",
};

export default function Page() {
  return <CheckoutPage />;
}