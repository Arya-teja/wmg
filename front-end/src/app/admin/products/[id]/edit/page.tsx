import AdminProductFormPage from "@/features/admin/pages/AdminProductFormPage";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminProductFormPage mode="edit" productId={id} />;
}