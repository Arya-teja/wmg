import api from "../lib/axios";
import { Product } from "../types";

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get<Product[]>("/products");
    return response.data;
  },

  async getBySlug(slug: string): Promise<Product> {
    const response = await api.get<Product>(`/products/slug/${slug}`);
    return response.data;
  },
};
