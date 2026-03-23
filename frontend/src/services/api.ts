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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BACKEND_URL = API_URL.replace(/\/$/, '');

// Attach audioUrl with full backend URL so browser can resolve it
function resolveMeetingAudioUrl(meeting: Meeting): Meeting {
  if (meeting.audioUrl && !meeting.audioUrl.startsWith('blob:') && !meeting.audioUrl.startsWith('http')) {
    return { ...meeting, audioUrl: `${BACKEND_URL}${meeting.audioUrl}` };
  }
  return meeting;
}

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
  const { data } = await client.get<{ user: User }>('/auth/me');
  return data.user;
};

// Meetings
export const getMeetings = async (): Promise<Meeting[]> => {
  const { data } = await client.get<{ meetings: Meeting[] }>('/meetings');
  return data.meetings.map((m) => resolveMeetingAudioUrl(m));
};

export const getMeeting = async (id: string): Promise<Meeting> => {
  const { data } = await client.get<{ meeting: Meeting }>(`/meetings/${id}`);
  return resolveMeetingAudioUrl(data.meeting);
};

export const createMeeting = async (formData: FormData): Promise<Meeting> => {
  const { data } = await client.post<{ meeting: Meeting }>('/meetings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentage = progressEvent.total
        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
        : 0;
      console.log(`Upload progress: ${percentage}%`);
    },
  });
  return data.meeting;
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
  const { data } = await client.get<{ commitments: Commitment[] }>(`/commitments?${params.toString()}`);
  return data.commitments;
};

export const updateCommitment = async (
  id: string,
  updates: { status?: string; text?: string; deadline?: string }
): Promise<Commitment> => {
  const { data } = await client.patch<{ commitment: Commitment }>(`/commitments/${id}`, updates);
  return data.commitment;
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
