// Base API Response Structure
export interface BaseAPIResponse {
  id: string | number;
  created_at?: string;
  updated_at?: string;
}

// Generic API Response for unknown endpoints
export interface GenericAPIResponse {
  [key: string]: unknown;
}

// Error Response
export interface APIErrorResponse {
  error: string;
  message?: string;
  details?: string;
  field_errors?: Record<string, string[]>;
}
