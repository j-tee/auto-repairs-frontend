import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Query string configuration for qs
export const QS_CONFIG = {
  arrayFormat: 'brackets' as const, // ?tags[]=tag1&tags[]=tag2
  encode: true,
  addQueryPrefix: true,
  allowDots: true, // Support nested objects like user.name=John
};

// API utility functions
export class ApiError extends Error {
  public status?: number;
  public response?: AxiosResponse;
  public code?: string;

  constructor(
    message: string, 
    status?: number, 
    response?: AxiosResponse,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.code = code;
  }
}

import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import qs from 'qs';

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Query string configuration for qs
export const QS_CONFIG = {
  arrayFormat: 'brackets' as const, // ?tags[]=tag1&tags[]=tag2
  encode: true,
  addQueryPrefix: true,
  allowDots: true, // Support nested objects like user.name=John
};

// API utility functions
export class ApiError extends Error {
  public status?: number;
  public response?: AxiosResponse;
  public code?: string;

  constructor(
    message: string, 
    status?: number, 
    response?: AxiosResponse,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.code = code;
  }
}

// Create Axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Use qs for query string serialization
  paramsSerializer: (params) => {
    return qs.stringify(params, QS_CONFIG);
  },
});

// Request interceptor for authentication, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error handling
    const customError = handleAxiosError(error);
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, customError);
    }

    return Promise.reject(customError);
  }
);

// Error handling utility
const handleAxiosError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const message = typeof data === 'object' && data && 'message' in data 
      ? String(data.message)
      : `HTTP ${status}: ${error.message}`;
    
    return new ApiError(message, status, error.response, error.code);
  } else if (error.request) {
    // Request made but no response received
    return new ApiError('Network error: No response received', undefined, undefined, error.code);
  } else {
    // Something else happened
    return new ApiError(`Request error: ${error.message}`, undefined, undefined, error.code);
  }
};

// Generic API functions
export const apiGet = async <T>(endpoint: string): Promise<T> => {
  const response = await createApiRequest(endpoint);
  return handleApiResponse<T>(response);
};

export const apiPost = async <T>(
  endpoint: string, 
  data?: unknown
): Promise<T> => {
  const response = await createApiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleApiResponse<T>(response);
};

export const apiPut = async <T>(
  endpoint: string, 
  data?: unknown
): Promise<T> => {
  const response = await createApiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleApiResponse<T>(response);
};

export const apiPatch = async <T>(
  endpoint: string, 
  data?: unknown
): Promise<T> => {
  const response = await createApiRequest(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleApiResponse<T>(response);
};

export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  const response = await createApiRequest(endpoint, {
    method: 'DELETE',
  });
  return handleApiResponse<T>(response);
};
