import { UserResponse } from '@/api/endpoints/auth';
import { GamificationStatsResponse, LeaderboardEntryResponse } from '@/api/endpoints/gamification';
import { IssueResponse } from '@/api/endpoints/issues';
import { Badge, Issue, LeaderboardEntry, LEVELS, User } from '@/types/civic';

const defaultBadges: Badge[] = [];

export function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function getLevelName(level: number) {
  return LEVELS.find((entry) => entry.level === level)?.name ?? 'Citizen';
}

export function toUiUser(user: UserResponse, stats?: GamificationStatsResponse): User {
  return {
    id: String(user.id),
    name: user.name,
    avatar: getAvatarUrl(user.name || user.phone_or_email),
    level: user.level,
    levelName: getLevelName(user.level),
    xp: user.xp,
    xpToNextLevel: stats?.next_level_xp ?? user.xp,
    streak: stats?.streak_days ?? user.streak_days,
    badges: defaultBadges,
    rank: 0,
    issuesReported: stats?.issues_reported ?? 0,
    issuesResolved: stats?.issues_resolved ?? 0,
  };
}

export function toUiIssue(issue: IssueResponse): Issue {
  return {
    id: String(issue.id),
    title: issue.title,
    description: issue.description,
    category: issue.category as Issue['category'],
    status: issue.status as Issue['status'],
    location: issue.location,
    imageUrl: issue.imageUrl,
    upvotes: issue.upvotes,
    reportedBy: issue.reportedBy,
    reportedAt: new Date(issue.reportedAt),
    hasUpvoted: issue.hasUpvoted,
  };
}

export function toUiLeaderboardEntry(entry: LeaderboardEntryResponse): LeaderboardEntry {
  return {
    rank: entry.rank,
    points: entry.points,
    change: entry.change,
    user: {
      id: String(entry.user_id),
      name: entry.name,
      avatar: getAvatarUrl(entry.name),
      level: entry.level,
      levelName: entry.levelName,
      xp: entry.xp,
      xpToNextLevel: entry.xp,
      streak: 0,
      badges: defaultBadges,
      rank: entry.rank,
      issuesReported: 0,
      issuesResolved: 0,
    },
  };
}
