import {
  AstrologerReadingDetail,
  KundaliFormData,
  PaginatedAstrologerReadings,
  PaginatedReadingHistory,
  PaginatedUserList,
  ReadingResponse,
  Role,
  TokenResponse,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  details?: Record<string, unknown>;

  constructor(statusCode: number, message: string, errorCode: string = 'ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('astro_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError(0, 'Unable to connect to server. Please ensure the backend is running.', 'NETWORK_ERROR');
  }

  // Parse JSON response
  let data: any = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    let details: Record<string, unknown> | undefined = undefined;

    if (data) {
      if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Pydantic validation error array
        errorMessage = data.detail.map((d: any) => `${d.loc?.slice(-1)[0] || 'Field'}: ${d.msg}`).join(', ');
      }
      if (data.error) errorCode = data.error;
      if (data.details) details = data.details;
    }

    if (response.status === 401) {
      errorMessage = 'Session expired or invalid credentials. Please log in again.';
      errorCode = 'UNAUTHORIZED';
    } else if (response.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
      errorCode = 'FORBIDDEN';
    } else if (response.status === 404) {
      errorMessage = errorMessage || 'The requested resource was not found.';
      errorCode = 'NOT_FOUND';
    } else if (response.status === 502) {
      errorMessage = 'The external astrology service is temporarily unavailable. Please try again in a moment.';
      errorCode = 'SERVICE_UNAVAILABLE';
    }

    throw new ApiError(response.status, errorMessage, errorCode, details);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (payload: { username: string; email: string; password: string }) =>
      request<TokenResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: { username: string; password: string }) =>
      request<TokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  users: {
    getMe: () => request<User>('/users/me'),
  },

  astrology: {
    createReading: (data: KundaliFormData) =>
      request<ReadingResponse>('/astrology/reading', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getHistory: (params: { page?: number; limit?: number; moon_sign?: string; sort?: 'created_at' | 'id'; order?: 'asc' | 'desc' } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.moon_sign) query.append('moon_sign', params.moon_sign);
      if (params.sort) query.append('sort', params.sort);
      if (params.order) query.append('order', params.order);
      const qs = query.toString();
      return request<PaginatedReadingHistory>(`/astrology/history${qs ? `?${qs}` : ''}`);
    },
  },

  astrologer: {
    getQueue: (params: { page?: number; limit?: number; is_reviewed?: boolean; sort?: 'created_at' | 'id'; order?: 'asc' | 'desc' } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.is_reviewed !== undefined) query.append('is_reviewed', params.is_reviewed.toString());
      if (params.sort) query.append('sort', params.sort);
      if (params.order) query.append('order', params.order);
      const qs = query.toString();
      return request<PaginatedAstrologerReadings>(`/astrologer/readings${qs ? `?${qs}` : ''}`);
    },
    getReadingDetail: (readingId: number) =>
      request<AstrologerReadingDetail>(`/astrologer/readings/${readingId}`),
    updateNote: (readingId: number, note: string) =>
      request<AstrologerReadingDetail>(`/astrologer/readings/${readingId}/note`, {
        method: 'PATCH',
        body: JSON.stringify({ note }),
      }),
  },

  admin: {
    getUsers: (params: { page?: number; limit?: number; search?: string; sort?: 'id' | 'username' | 'created_at'; order?: 'asc' | 'desc' } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.search) query.append('search', params.search);
      if (params.sort) query.append('sort', params.sort);
      if (params.order) query.append('order', params.order);
      const qs = query.toString();
      return request<PaginatedUserList>(`/admin/users${qs ? `?${qs}` : ''}`);
    },
    getUserById: (userId: number) => request<User>(`/admin/users/${userId}`),
    updateRole: (userId: number, role: Role) =>
      request<User>(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },

  health: {
    checkLive: () => request<{ status: string }>('/health'),
    checkReady: () => request<{ status: string; database: string }>('/health/ready'),
  },
};
