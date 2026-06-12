import { apiRequest } from './api';

export interface DashboardMetrics {
  totalRecordings: number;
  totalClients: number;
  totalHours: number;
  recordingsThisMonth: number;
}

export interface ChartDataset {
  uploadsOverTime: { month: string; recordings: number }[];
  categoriesDistribution: { name: string; value: number }[];
  durationTrends: { month: string; avgMinutes: number }[];
}

export const analyticsApi = {
  getMetrics: () => apiRequest<DashboardMetrics>('/analytics/metrics'),
  getCharts: () => apiRequest<ChartDataset>('/analytics/charts'),
};
