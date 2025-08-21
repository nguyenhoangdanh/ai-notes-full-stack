/**
 * Lightweight fetch-based API client for AI Notes Backend
 * Provides typed HTTP operations with authentication and error handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export class HTTPError extends Error {
  constructor(
    public status: number,
    public response: ApiError,
    public url: string
  ) {
    super(response.message || `HTTP ${status} Error`);
    this.name = 'HTTPError';
  }
}

export interface RequestOptions {
  query?: Record<string, any>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseURL: string;
  private tokenGetter?: () => string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
  }

  setTokenGetter(getter: () => string | null) {
    this.tokenGetter = getter;
  }

  private serializeQuery(query: Record<string, any>): string {
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, String(item)));
        } else {
          params.append(key, String(value));
        }
      }
    }
    
    return params.toString();
  }

  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.tokenGetter?.();
    if (token) {
      // Set both Authorization header (fallback) and X-Access-Token (iOS compatibility)
      headers.Authorization = `Bearer ${token}`;
      headers['X-Access-Token'] = token;
      // Add iOS-specific headers for better compatibility
      headers['X-iOS-Fallback'] = 'true';
    }

    return headers;
  }

  private getRequestConfig(): RequestInit {
    return {
      credentials: 'include', // Essential for cookies to be sent cross-origin
      // Additional options for iOS/Safari compatibility
      mode: 'cors',
    };
  }

  private async handleResponse<T>(response: Response, url: string): Promise<T> {
    let data: any;
    
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error: ApiError = data || {
        success: false,
        message: response.statusText || 'Unknown error',
        error: response.statusText || 'Unknown error',
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      };
      
      throw new HTTPError(response.status, error, url);
    }

    return data;
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { query, headers, signal } = options;
    const queryString = query ? this.serializeQuery(query) : '';
    const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(headers),
      signal,
      ...this.getRequestConfig(),
    });

    return this.handleResponse<T>(response, url);
  }

  async post<T>(endpoint: string, options: RequestOptions & { body?: any } = {}): Promise<T> {
    const { body, headers, signal } = options;
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(headers),
      body: body instanceof FormData ? body : JSON.stringify(body),
      signal,
      ...this.getRequestConfig(),
    });

    return this.handleResponse<T>(response, url);
  }

  async put<T>(endpoint: string, options: RequestOptions & { body?: any } = {}): Promise<T> {
    const { body, headers, signal } = options;
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(headers),
      body: body instanceof FormData ? body : JSON.stringify(body),
      signal,
      ...this.getRequestConfig(),
    });

    return this.handleResponse<T>(response, url);
  }

  async patch<T>(endpoint: string, options: RequestOptions & { body?: any } = {}): Promise<T> {
    const { body, headers, signal } = options;
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.buildHeaders(headers),
      body: body instanceof FormData ? body : JSON.stringify(body),
      signal,
      ...this.getRequestConfig(),
    });

    return this.handleResponse<T>(response, url);
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { headers, signal } = options;
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(headers),
      signal,
      ...this.getRequestConfig(),
    });

    return this.handleResponse<T>(response, url);
  }
}

// Create singleton instance
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
);