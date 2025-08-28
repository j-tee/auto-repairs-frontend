// Common types used across the application

export interface APIError {
  message: string;
  status?: number;
  details?: string;
}

// Generic error type for catch blocks
export type CatchError = Error | APIError | { message: string } | string | unknown;

// Utility function to handle errors safely
export function getErrorMessage(error: CatchError): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

// Utility for handling API errors in Redux thunks
export function getAPIErrorMessage(error: CatchError): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const errorWithResponse = error as { response?: { data?: { message?: string; error?: string } } };
    return errorWithResponse.response?.data?.message || 
           errorWithResponse.response?.data?.error || 
           'API request failed';
  }
  return getErrorMessage(error);
}

// Query filter interfaces
export interface BaseQuery {
  search?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

// Union type for all possible query parameters
export type AnyQuery = 
  | BaseQuery 
  | Record<string, string | number | boolean | undefined>
  | undefined;

// Update data types
export interface BaseUpdateData {
  [key: string]: unknown;
}

// API Response wrappers
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ListResponse<T> {
  results?: T[];
  data?: T[];
  items?: T[];
}
