import api from "../lib/axios";

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const response = await api.post<Category>("/categories", payload);
    return response.data;
  },

  async update(
    id: string,
    payload: UpdateCategoryPayload
  ): Promise<Category> {
    const response = await api.patch<Category>(`/categories/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};