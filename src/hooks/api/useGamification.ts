import { useQuery } from '@tanstack/react-query';
import { gamificationEndpoints } from '@/api/endpoints/gamification';

export const useLeaderboard = (limit = 20, skip = 0) => {
  return useQuery({
    queryKey: ['gamification', 'leaderboard', limit, skip],
    queryFn: () => gamificationEndpoints.getLeaderboard(limit, skip),
    staleTime: 5 * 60 * 1000, // 5 minutes (leaderboard changes less often)
  });
};

export const useGamificationStats = () => {
  return useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: () => gamificationEndpoints.getMe(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
