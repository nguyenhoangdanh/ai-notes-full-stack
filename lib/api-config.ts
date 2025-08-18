/**
 * API Configuration and initialization
 */

import { apiClient } from './api-client';

let isInitialized = false;

export function initializeApiClient() {
  if (isInitialized) {
    return;
  }

  // Configure token getter - this will be called on each request
  apiClient.setTokenGetter(() => {
    return localStorage.getItem('ai-notes-token');
  });

  isInitialized = true;
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('ai-notes-token', token);
  } else {
    localStorage.removeItem('ai-notes-token');
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('ai-notes-token');
}

export function clearAuthToken() {
  localStorage.removeItem('ai-notes-token');
}