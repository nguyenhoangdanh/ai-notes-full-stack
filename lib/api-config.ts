/**
 * API Configuration and initialization
 * Supports dual authentication: cookies (preferred) + localStorage (fallback)
 */

import { apiClient } from './api-client';

let isInitialized = false;

/**
 * Get auth token from cookie (preferred) or localStorage (fallback)
 */
function getAuthTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  
  // First, try to get from cookie (preferred for cross-platform compatibility)
  const cookieToken = getCookieValue('ai-notes-token');
  if (cookieToken) {
    return cookieToken;
  }
  
  // Fallback to localStorage
  return localStorage.getItem('ai-notes-token');
}

/**
 * Helper function to get cookie value by name
 */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

export function initializeApiClient() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  // Configure token getter - this will be called on each request
  // Uses dual authentication: cookie (preferred) + localStorage (fallback)
  apiClient.setTokenGetter(() => {
    return getAuthTokenFromStorage();
  });

  isInitialized = true;
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  
  if (token) {
    // Store in localStorage as fallback
    localStorage.setItem('ai-notes-token', token);
    
    // Note: Cookies are set by the server in our implementation
    // The cookie will be automatically sent by the browser on subsequent requests
  } else {
    // Clear both storage methods
    localStorage.removeItem('ai-notes-token');
    // Cookie clearing is handled by server logout endpoint
  }
}

export function getAuthToken(): string | null {
  return getAuthTokenFromStorage();
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  localStorage.removeItem('ai-notes-token');
  
  // Note: Cookie clearing should be done via server logout endpoint
  // for proper security, but we can also clear it client-side as fallback
  if (typeof document !== 'undefined') {
    document.cookie = 'ai-notes-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}