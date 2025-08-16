// This file is replaced by the useAuth hook in AuthContext.tsx
// Keeping this file as a reference but it should not be used

export function _deprecatedUseAuth() {
  console.warn('This useAuth hook is deprecated. Use the one from AuthContext instead.')
  return {
    user: null,
    isLoading: false
  }
}