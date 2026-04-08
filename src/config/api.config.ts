/**
 * API Configuration
 * Centralized configuration for API client
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  auth: {
    register: '/v1/auth/register',
    login: '/v1/auth/login',
    me: '/v1/auth/me',
  },
  issues: {
    create: '/v1/issues',
    list: '/v1/issues',
    map: '/v1/issues/map',
    detail: (id: string) => `/v1/issues/${id}`,
    upvote: (id: string) => `/v1/issues/${id}/upvote`,
  },
  media: {
    presignUpload: '/v1/media/presign-upload',
  },
  gamification: {
    leaderboard: '/v1/gamification/leaderboard',
    stats: '/v1/gamification/me',
  },
};

export const TOKEN_KEY = 'civic_auth_token';

// React Query configuration
export const QUERY_CONFIG = {
  staleTime: {
    user: 1000 * 60 * 5, // 5 minutes
    issues: 1000 * 60, // 1 minute
    issueDetail: 1000 * 60, // 1 minute
    leaderboard: 1000 * 60 * 5, // 5 minutes
    stats: 1000 * 60 * 2, // 2 minutes
  },
  cacheTime: 1000 * 60 * 10, // 10 minutes
  retry: {
    authenticated: 3,
    unauthenticated: 1,
  },
};
