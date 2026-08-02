import api from '@/lib/axios';
import { Order } from '@/types';

interface CreateOrderPayload {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  voucherId?: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await api.post<Order>('/orders', payload);
    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },
};
