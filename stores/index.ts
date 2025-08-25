// Store exports for easy importing
export { useAuthStore } from './auth.store'
export { useAIStore, useAI } from './ai.store'
export { useOfflineNotesStore, useOfflineNotes } from './offline-notes.store'
export { useNotesStore, notesUtils } from './notes.store'

// Re-export common types for convenience
export type { User, LoginDto, RegisterDto } from '../types/auth.types'
export type { SemanticSearchResult, AIConversation, AIMessage } from '../types'
export type { OfflineNote, OfflineWorkspace } from '../lib/offline-storage'