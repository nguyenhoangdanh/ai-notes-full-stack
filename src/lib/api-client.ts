import { ErrorResponse } from '../types'

// Configuration for the API client
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  getToken?: () => string | null
  onError?: (error: HTTPError) => void
}

// HTTP Error class with detailed information
export class HTTPError extends Error {
  public readonly status: number
  public readonly statusText: string
  public readonly response?: ErrorResponse
  public readonly url: string

  constructor(
    status: number, 
    statusText: string, 
    url: string, 
    response?: ErrorResponse
  ) {
    const message = response?.message || statusText || `HTTP ${status} Error`
    super(message)
    
    this.name = 'HTTPError'
    this.status = status
    this.statusText = statusText
    this.url = url
    this.response = response
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }
}

// Request options interface
export interface RequestOptions {
  headers?: Record<string, string>
  signal?: AbortSignal
  timeout?: number
}

export interface RequestOptionsWithBody extends RequestOptions {
  body?: any
}

export interface RequestOptionsWithQuery extends RequestOptions {
  query?: Record<string, any>
}

// API Client class
export class ApiClient {
  private config: Required<ApiClientConfig>

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: config.baseURL.replace(/\/$/, ''), // Remove trailing slash
      timeout: config.timeout || 30000,
      getToken: config.getToken || (() => null),
      onError: config.onError || (() => {}),
    }
  }

  // Serialize query parameters
  private serializeQuery(query: Record<string, any>): string {
    const params = new URLSearchParams()
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)))
        } else {
          params.append(key, String(value))
        }
      }
    })
    
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  // Build full URL with query parameters
  private buildUrl(path: string, query?: Record<string, any>): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const baseUrl = `${this.config.baseURL}/${cleanPath}`
    
    if (query && Object.keys(query).length > 0) {
      return baseUrl + this.serializeQuery(query)
    }
    
    return baseUrl
  }

  // Prepare request headers
  private prepareHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    }

    // Add authentication if token is available
    const token = this.config.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  // Handle fetch response
  private async handleResponse<T>(response: Response, url: string): Promise<T> {
    let responseData: any

    // Try to parse response as JSON
    try {
      const text = await response.text()
      responseData = text ? JSON.parse(text) : null
    } catch {
      responseData = null
    }

    if (!response.ok) {
      const error = new HTTPError(
        response.status,
        response.statusText,
        url,
        responseData
      )
      
      this.config.onError(error)
      throw error
    }

    return responseData
  }

  // Make HTTP request
  private async request<T>(
    method: string,
    path: string,
    options: RequestOptionsWithBody & RequestOptionsWithQuery = {}
  ): Promise<T> {
    const { body, query, headers = {}, signal, timeout } = options
    
    const url = this.buildUrl(path, query)
    const requestHeaders = this.prepareHeaders(headers)

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout || this.config.timeout)

    // Use provided signal or timeout signal
    const requestSignal = signal || controller.signal

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: requestSignal,
      }

      // Add body for non-GET requests
      if (body !== undefined && method !== 'GET') {
        if (body instanceof FormData) {
          // Remove Content-Type for FormData (browser will set it with boundary)
          delete requestHeaders['Content-Type']
          fetchOptions.body = body
        } else {
          fetchOptions.body = JSON.stringify(body)
        }
      }

      const response = await fetch(url, fetchOptions)
      
      clearTimeout(timeoutId)
      return await this.handleResponse<T>(response, url)
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        const networkError = new HTTPError(0, 'Network Error', url)
        this.config.onError(networkError)
        throw networkError
      }
      
      if (error instanceof HTTPError) {
        throw error
      }
      
      // AbortError or other errors
      const unknownError = new HTTPError(0, error instanceof Error ? error.message : 'Unknown Error', url)
      this.config.onError(unknownError)
      throw unknownError
    }
  }

  // HTTP methods
  public async get<T>(path: string, options: RequestOptionsWithQuery = {}): Promise<T> {
    return this.request<T>('GET', path, options)
  }

  public async post<T>(path: string, options: RequestOptionsWithBody = {}): Promise<T> {
    return this.request<T>('POST', path, options)
  }

  public async put<T>(path: string, options: RequestOptionsWithBody = {}): Promise<T> {
    return this.request<T>('PUT', path, options)
  }

  public async patch<T>(path: string, options: RequestOptionsWithBody = {}): Promise<T> {
    return this.request<T>('PATCH', path, options)
  }

  public async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', path, options)
  }

  // Special method for streaming responses
  public async stream(
    path: string, 
    options: RequestOptionsWithBody = {}
  ): Promise<ReadableStream<Uint8Array> | null> {
    const { body, headers = {}, signal, timeout } = options
    
    const url = this.buildUrl(path)
    const requestHeaders = this.prepareHeaders(headers)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout || this.config.timeout)
    const requestSignal = signal || controller.signal

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: requestSignal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let responseData: any
        try {
          responseData = await response.json()
        } catch {
          responseData = null
        }
        
        const error = new HTTPError(response.status, response.statusText, url, responseData)
        this.config.onError(error)
        throw error
      }

      return response.body
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof HTTPError) {
        throw error
      }
      
      const unknownError = new HTTPError(0, error instanceof Error ? error.message : 'Unknown Error', url)
      this.config.onError(unknownError)
      throw unknownError
    }
  }

  // Update configuration
  public updateConfig(updates: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}

// Create and export default API client instance
let apiClient: ApiClient

export function createApiClient(config: ApiClientConfig): ApiClient {
  apiClient = new ApiClient(config)
  return apiClient
}

export function getApiClient(): ApiClient {
  if (!apiClient) {
    throw new Error('API client not initialized. Call createApiClient() first.')
  }
  return apiClient
}

export { apiClient }