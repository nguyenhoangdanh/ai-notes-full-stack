/**
 * API Configuration and initialization
 */

import { apiClient } from './api-client';

let isInitialized = false;

export function initializeApiClient() {
  if (isInitialized || typeof window === 'undefined') {
    return;
  }

  // Configure token getter - this will be called on each request
  apiClient.setTokenGetter(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ai-notes-token');
  });

  isInitialized = true;
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  
  if (token) {
    localStorage.setItem('ai-notes-token', token);
  } else {
    localStorage.removeItem('ai-notes-token');
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ai-notes-token');
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ai-notes-token');
}