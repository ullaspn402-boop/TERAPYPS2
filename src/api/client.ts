const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL;
  if (!envUrl) return 'https://speechcare-backend.onrender.com/api';
  const cleanUrl = envUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE_URL = getBaseUrl();


export const apiClient = {
  get: async (endpoint: string) => {
    return _fetch(endpoint, { method: 'GET' });
  },
  post: async (endpoint: string, body?: any) => {
    return _fetch(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put: async (endpoint: string, body?: any) => {
    return _fetch(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  patch: async (endpoint: string, body?: any) => {
    return _fetch(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete: async (endpoint: string) => {
    return _fetch(endpoint, { method: 'DELETE' });
  },
};

const _fetch = async (endpoint: string, options: RequestInit) => {
  const token = localStorage.getItem('speechcare_token');
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = text;
  }

  if (!response.ok) {
    const error: any = new Error(data.error || data.message || `API Error: ${response.status}`);
    error.details = data.details;
    throw error;
  }

  return data;
};
