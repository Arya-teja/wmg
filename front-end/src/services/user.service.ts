import api from "../lib/axios";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { orders: number };
}

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async updateRole(id: string, role: "USER" | "ADMIN"): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  async deactivate(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/deactivate`);
    return response.data;
  },

  async activate(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/activate`);
    return response.data;
  },
};
