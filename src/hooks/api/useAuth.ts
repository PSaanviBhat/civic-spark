import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authEndpoints, LoginRequest, RegisterRequest } from '@/api/endpoints/auth';
import { apiClient } from '@/api/client';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authEndpoints.register(data),
    onSuccess: (data) => {
      apiClient.setToken(data.access_token);
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authEndpoints.login(data),
    onSuccess: (data) => {
      apiClient.setToken(data.access_token);
    },
  });
};

export const useCurrentUser = () => {
  const token = apiClient.getToken();
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authEndpoints.getMe(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if no token
      if (!token) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return () => {
    apiClient.clearToken();
    queryClient.clear();
  };
};
