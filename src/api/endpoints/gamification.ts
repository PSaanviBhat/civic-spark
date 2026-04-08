import { apiClient } from '../client';

export interface LeaderboardEntryResponse {
  rank: number;
  user_id: number;
  name: string;
  level: number;
  xp: number;
  levelName: string;
  points: number;
  change: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntryResponse[];
  current_user_rank: number;
  period: string;
}

export interface GamificationStatsResponse {
  xp: number;
  level: number;
  next_level_xp: number;
  streak_days: number;
  badges_earned: number;
  issues_reported: number;
  issues_resolved: number;
}

export const gamificationEndpoints = {
  getLeaderboard: async (limit = 20, skip = 0): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());
    return apiClient.get(`/v1/gamification/leaderboard?${params.toString()}`);
  },

  getMe: async (): Promise<GamificationStatsResponse> => {
    return apiClient.get('/v1/gamification/me');
  },
};
