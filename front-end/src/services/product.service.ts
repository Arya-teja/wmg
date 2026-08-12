import api from "../lib/axios";
import { Product } from "../types";

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  sizes?: string[];
  images?: { url: string; order?: number }[];
  colors?: { name: string; hex: string }[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get<Product[]>("/products");
    return response.data;
  },

  async getBySlug(slug: string): Promise<Product> {
    const response = await api.get<Product>(`/products/slug/${slug}`);
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const response = await api.post<Product>("/products", payload);
    return response.data;
  },

  async updateProduct(
    id: string,
    payload: UpdateProductPayload
  ): Promise<Product> {
    const response = await api.patch<Product>(`/products/${id}`, payload);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
