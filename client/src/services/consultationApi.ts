import { apiRequest } from './api';

export interface ConsultationSummary {
  keyTopics: string[];
  recommendations: string[];
  actionItems: string[];
  followUps: string[];
  keywords: string[];
  sentiment: string;
}

export interface ConsultationData {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  title: string;
  recordingUrl: string;
  transcript?: string;
  summary?: ConsultationSummary;
  notes?: string;
  tags: string[];
  consentGiven: boolean;
  consentTimestamp: string;
  duration: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const consultationApi = {
  list: (filters: {
    search?: string;
    clientId?: string;
    tags?: string;
    startDate?: string;
    endDate?: string;
    minDuration?: number;
    maxDuration?: number;
    showDeleted?: boolean;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    return apiRequest<ConsultationData[]>(`/consultations?${params.toString()}`);
  },

  getById: (id: string) =>
    apiRequest<ConsultationData>(`/consultations/${id}`),

  create: (formData: FormData) =>
    apiRequest<ConsultationData>('/consultations', {
      method: 'POST',
      body: formData,
    }),

  update: (id: string, body: Partial<ConsultationData>) =>
    apiRequest<ConsultationData>(`/consultations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  softDelete: (id: string) =>
    apiRequest<void>(`/consultations/${id}`, {
      method: 'DELETE',
    }),

  restore: (id: string) =>
    apiRequest<ConsultationData>(`/consultations/${id}/restore`, {
      method: 'POST',
    }),

  hardDelete: (id: string) =>
    apiRequest<void>(`/consultations/${id}/permanent`, {
      method: 'DELETE',
    }),

  exportFile: (id: string, format: 'md' | 'txt'): Promise<string> =>
    apiRequest<string>(`/consultations/${id}/export?format=${format}`),
};
