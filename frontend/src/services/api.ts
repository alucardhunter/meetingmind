import axios from 'axios';
import type {
  Meeting,
  User,
  AuthResponse,
  Stats,
  Settings,
  Commitment,
  CommitmentFilters,
} from '@/types';

const API_URL = 'http://localhost:3001';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

export const signup = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/signup', { email, password, name });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await client.get<User>('/auth/me');
  return data;
};

// Meetings
export const getMeetings = async (): Promise<Meeting[]> => {
  const { data } = await client.get<Meeting[]>('/meetings');
  return data;
};

export const getMeeting = async (id: string): Promise<Meeting> => {
  const { data } = await client.get<Meeting>(`/meetings/${id}`);
  return data;
};

export const createMeeting = async (formData: FormData): Promise<Meeting> => {
  const { data } = await client.post<Meeting>('/meetings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentage = progressEvent.total
        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
        : 0;
      console.log(`Upload progress: ${percentage}%`);
    },
  });
  return data;
};

export const deleteMeeting = async (id: string): Promise<void> => {
  await client.delete(`/meetings/${id}`);
};

export const getStats = async (): Promise<Stats> => {
  const { data } = await client.get<Stats>('/meetings/stats');
  return data;
};

// Commitments
export const getCommitments = async (filters?: CommitmentFilters): Promise<Commitment[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.contact) params.set('contact', filters.contact);
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.set('dateTo', filters.dateTo);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  const { data } = await client.get<Commitment[]>(`/commitments?${params.toString()}`);
  return data;
};

export const updateCommitment = async (
  id: string,
  updates: { status?: string; text?: string; deadline?: string }
): Promise<Commitment> => {
  const { data } = await client.patch<Commitment>(`/commitments/${id}`, updates);
  return data;
};

export const getCommitmentStats = async (): Promise<{
  total: number;
  open: number;
  fulfilled: number;
  overdue: number;
}> => {
  const { data } = await client.get('/commitments/stats');
  return data;
};

// Export
export const exportToNotion = async (meetingId: string): Promise<{ success: boolean }> => {
  const { data } = await client.post<{ success: boolean }>(`/meetings/${meetingId}/export/notion`);
  return data;
};

export const exportToSlack = async (meetingId: string): Promise<{ success: boolean }> => {
  const { data } = await client.post<{ success: boolean }>(`/meetings/${meetingId}/export/slack`);
  return data;
};

// Settings
export const getSettings = async (): Promise<Settings> => {
  const { data } = await client.get<Settings>('/settings');
  return data;
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  const { data } = await client.put<Settings>('/settings', settings);
  return data;
};

export const deleteAccount = async (): Promise<void> => {
  await client.delete('/settings/account');
};

export default client;
