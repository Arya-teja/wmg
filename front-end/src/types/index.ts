export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
}

export interface ProductImage {
  id: string;
  url: string;
  order: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  label?: string;
  sizes: string[];
  images: ProductImage[];
  colors: ProductColor[];
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";

export interface Voucher {
  id: string;
  code: string;
  discount: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: string;
  provider: string;
  method: string | null;
  externalId: string | null;
  paymentUrl: string | null;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  size?: string;
  color?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
}

export interface Order {
  id: string;
  userId: string;
  voucherId: string | null;
  total: string;
  discountTotal: string;
  grandTotal: string;
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment: Payment | null;
  voucher: Voucher | null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export interface CartItem {
  id: string; // ID unik dari CartItem di database
  quantity: number;
  size?: string;
  color?: string;
  product: Product; // Relasi ke tabel produk, membawa name, price, imageUrl, dll
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}
