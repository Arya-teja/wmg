import api from "@/lib/axios";
import { Cart } from "@/types";

export interface AddItemPayload {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export const cartService = {
  // Mengambil data keranjang lengkap beserta relasi produknya
  async getCart(): Promise<Cart> {
    const response = await api.get<Cart>("/cart");
    return response.data;
  },

  // Menambahkan produk ke keranjang
  async addToCart(payload: AddItemPayload): Promise<void> {
    await api.post("/cart/items", payload);
  },

  // Mengubah jumlah (quantity) item di keranjang
  // Menggunakan parameter itemId (ID keranjang belanja), bukan productId
  async updateCartItem(itemId: string, quantity: number): Promise<void> {
    await api.patch(`/cart/items/${itemId}`, { quantity });
  },

  // Menghapus satu item dari keranjang
  async removeCartItem(itemId: string): Promise<void> {
    await api.delete(`/cart/items/${itemId}`);
  },
};
