import ProductDetailPage from "@/features/product-detail/pages/ProductDetailPage";

// 1. Tambahkan async dan ubah tipe menjadi Promise
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 2. Buka (await) params-nya terlebih dahulu
  const resolvedParams = await params;

  // 3. Kirim slug yang sudah terbaca dengan benar ke komponen
  return <ProductDetailPage slug={resolvedParams.slug} />;
}
