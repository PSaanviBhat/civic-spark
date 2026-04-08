import { apiClient } from '../client';

export interface LocationSchema {
  lat: number;
  lng: number;
  address: string;
}

export interface IssueCreate {
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  media_keys?: string[];
}

export interface IssueResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  location: LocationSchema;
  reportedBy: string;
  upvotes: number;
  reportedAt: string;
  imageUrl?: string;
  hasUpvoted: boolean;
  isVerified: boolean;
  verificationStatus: string;
  aiConfidence: number;
  isTracked: boolean;
}

export interface IssueUpdate {
  status?: string;
  description?: string;
}

export interface IssueListResponse {
  issues: IssueResponse[];
  total: number;
  page: number;
  page_size: number;
}

export const issuesEndpoints = {
  create: async (data: IssueCreate): Promise<IssueResponse> => {
    return apiClient.post('/v1/issues', data);
  },

  list: async (skip = 0, limit = 20, category?: string, status?: string): Promise<IssueListResponse> => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return apiClient.get(`/v1/issues?${params.toString()}`);
  },

  getMapIssues: async (minLat: number, maxLat: number, minLng: number, maxLng: number, category?: string): Promise<IssueListResponse> => {
    const params = new URLSearchParams();
    params.append('min_lat', minLat.toString());
    params.append('max_lat', maxLat.toString());
    params.append('min_lng', minLng.toString());
    params.append('max_lng', maxLng.toString());
    if (category) params.append('category', category);
    return apiClient.get(`/v1/issues/map?${params.toString()}`);
  },

  getOne: async (id: number): Promise<IssueResponse> => {
    return apiClient.get(`/v1/issues/${id}`);
  },

  upvote: async (id: number): Promise<{ issue_id: number; upvotes: number; hasUpvoted: boolean }> => {
    return apiClient.post(`/v1/issues/${id}/upvote`);
  },

  track: async (id: number): Promise<{ issue_id: number; isTracked: boolean }> => {
    return apiClient.post(`/v1/issues/${id}/track`);
  },

  updateStatus: async (id: number, data: IssueUpdate): Promise<IssueResponse> => {
    return apiClient.patch(`/v1/issues/${id}/status`, data);
  },
};
