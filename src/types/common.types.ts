// Common API response types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  message?: string
}

export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  details?: any
}

// Pagination and query types
export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface SortQuery {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchQuery extends PaginationQuery {
  q: string
  filters?: Record<string, any>
}

// Base entity interface
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}