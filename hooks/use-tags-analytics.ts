/**
 * Stub implementation of tags and analytics hooks
 * TODO: Implement proper types and functionality when backend is connected
 */

// Simple stub functions to avoid build errors
export function useTags() {
  return {
    data: [],
    isLoading: false,
    error: null
  }
}

export function useTagHierarchy() {
  return {
    data: null,
    isLoading: false,
    error: null
  }
}

export function useAnalyticsOverview() {
  return {
    data: null,
    isLoading: false,
    error: null
  }
}

export function useWorkspaceAnalytics() {
  return {
    data: null,
    isLoading: false,
    error: null
  }
}

export function useContentAnalytics() {
  return {
    data: null,
    isLoading: false,
    error: null
  }
}

// Placeholder for future implementation
export function useCreateTag() {
  return {
    mutate: (data: any) => console.log('Create tag:', data),
    isPending: false,
    error: null
  }
}