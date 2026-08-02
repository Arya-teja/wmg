import OrderDetailPage from '@/features/orders/pages/OrderDetailPage';

export default async function OrderIdRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  return <OrderDetailPage id={resolvedParams.id} />;
}