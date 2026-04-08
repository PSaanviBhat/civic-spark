import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { issuesEndpoints, IssueCreate, IssueListResponse } from '@/api/endpoints/issues';

export const useIssuesList = (skip = 0, limit = 20, category?: string, status?: string) => {
  return useQuery({
    queryKey: ['issues', 'list', skip, limit, category, status],
    queryFn: () => issuesEndpoints.list(skip, limit, category, status),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useMapIssues = (minLat: number, maxLat: number, minLng: number, maxLng: number, category?: string) => {
  return useQuery({
    queryKey: ['issues', 'map', minLat, maxLat, minLng, maxLng, category],
    queryFn: () => issuesEndpoints.getMapIssues(minLat, maxLat, minLng, maxLng, category),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useIssueDetail = (issueId: number) => {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => issuesEndpoints.getOne(issueId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IssueCreate) => issuesEndpoints.create(data),
    onSuccess: () => {
      // Invalidate issues list to refresh
      queryClient.invalidateQueries({ queryKey: ['issues', 'list'] });
    },
  });
};

export const useUpvoteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: number) => issuesEndpoints.upvote(issueId),
    onSuccess: (data) => {
      // Invalidate issue detail
      queryClient.invalidateQueries({ queryKey: ['issues', data.issue_id] });
      // Invalidate issues list
      queryClient.invalidateQueries({ queryKey: ['issues', 'list'] });
      // Invalidate map issues
      queryClient.invalidateQueries({ queryKey: ['issues', 'map'] });
    },
  });
};

export const useTrackIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: number) => issuesEndpoints.track(issueId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues', data.issue_id] });
      queryClient.invalidateQueries({ queryKey: ['issues', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['issues', 'map'] });
    },
  });
};

export const useUpdateIssueStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, status }: { issueId: number; status: string }) =>
      issuesEndpoints.updateStatus(issueId, { status }),
    onSuccess: (issue) => {
      queryClient.invalidateQueries({ queryKey: ['issues', issue.id] });
      queryClient.invalidateQueries({ queryKey: ['issues', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['issues', 'map'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'me'] });
    },
  });
};
