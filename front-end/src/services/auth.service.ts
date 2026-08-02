import api from '@/lib/axios';
import { AuthResponse } from '@/types';
import { LoginFormData, RegisterPayload } from '@/features/auth/types/auth';


export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};