import { apiRequest } from './api';

export interface ClientData {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt?: string;
}

export const clientApi = {
  list: (search?: string) =>
    apiRequest<ClientData[]>(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  create: (body: Omit<ClientData, '_id' | 'id'>) =>
    apiRequest<ClientData>('/clients', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Partial<ClientData>) =>
    apiRequest<ClientData>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/clients/${id}`, {
      method: 'DELETE',
    }),
};
