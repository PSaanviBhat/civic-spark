import { apiClient } from '../client';

export interface LoginRequest {
  phone_or_email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone_or_email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  name: string;
  phone_or_email: string;
  level: number;
  xp: number;
  trust_score: number;
  streak_days: number;
}

export const authEndpoints = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    return apiClient.post('/v1/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    return apiClient.post('/v1/auth/login', data);
  },

  getMe: async (): Promise<UserResponse> => {
    return apiClient.get('/v1/auth/me');
  },
};
