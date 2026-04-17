import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const api = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<ApiResponse<T>>(url);
    return response.data;
  },

  post: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data;
  },

  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data;
  },
};

export const publicApi = {
  getToday: () => api.get<any>('/api/calendar/today'),
  getByDate: (date: string) => api.get<any>(`/api/calendar/date/${date}`),
  getByMonth: (year: number, month: number) => api.get<any>(`/api/calendar/month/${year}/${month}`),
  getSpecialDays: (date: string) => api.get<any>(`/api/special-days/date/${date}`),
  getUpcomingSpecialDays: (limit = 10) => api.get<any>(`/api/special-days/upcoming?limit=${limit}`),
};

export default apiClient;
