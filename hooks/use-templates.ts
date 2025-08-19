/**
 * Stub implementation of templates hooks
 * TODO: Implement proper types and functionality when backend is connected
 */

// Simple stub functions to avoid build errors
export function useTemplates() {
  return {
    data: [],
    isLoading: false,
    error: null
  }
}

export function usePublicTemplates() {
  return {
    data: [],
    isLoading: false,
    error: null
  }
}

export function useTemplateCategories() {
  return {
    data: [],
    isLoading: false,
    error: null
  }
}

export function useVoiceNotes() {
  return {
    data: [],
    isLoading: false,
    error: null
  }
}

export function useVoiceNoteStats() {
  return {
    data: null,
    isLoading: false,
    error: null
  }
}

export function useUploadVoiceNote() {
  return {
    mutate: (data: any) => console.log('Upload voice note:', data),
    isPending: false,
    error: null
  }
}

export function useDeleteVoiceNote() {
  return {
    mutate: (id: string) => console.log('Delete voice note:', id),
    isPending: false,
    error: null
  }
}