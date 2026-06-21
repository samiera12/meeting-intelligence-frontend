import { apiClient } from './client';
import { User } from '../types';

interface AuthResponse {
  traceId: string;
  success: boolean;
  data: { user: User; token: string };
}

export async function register(name: string, email: string, password: string) {
  const res = await apiClient.post<AuthResponse>('/api/auth/register', { name, email, password });
  return res.data.data;
}

export async function login(email: string, password: string) {
  const res = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  return res.data.data;
}