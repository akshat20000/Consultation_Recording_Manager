import { apiRequest } from './api';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export const authApi = {
  register: (body: any) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: any) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMe: () => apiRequest<UserResponse>('/auth/me'),
};
