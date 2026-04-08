import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Sparkles } from 'lucide-react';

import { CategoryFilter } from '@/components/common';
import { QuickStats, UserStatsCard } from '@/components/gamification';
import { IssueCard } from '@/components/issue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { useGamificationStats } from '@/hooks/api/useGamification';
import { useIssuesList, useUpvoteIssue } from '@/hooks/api/useIssues';
import { toUiIssue, toUiUser } from '@/lib/adapters';
import { IssueCategory } from '@/types/civic';

interface HomeViewProps {
  onNavigate: (tab: 'map' | 'report' | 'leaderboard' | 'profile') => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const { data: currentUser } = useCurrentUser();
  const { data: statsData } = useGamificationStats();
  const { data: issuesData, isLoading } = useIssuesList(
    0,
    20,
    selectedCategory === 'all' ? undefined : selectedCategory,
  );
  const upvoteIssue = useUpvoteIssue();

  const uiUser = currentUser ? toUiUser(currentUser, statsData) : null;
  const issues = useMemo(() => (issuesData?.issues ?? []).map(toUiIssue), [issuesData]);
  const stats = {
    totalIssues: issuesData?.total ?? issues.length,
    resolved: issues.filter((issue) => issue.status === 'resolved').length,
    inProgress: issues.filter((issue) => issue.status === 'in-progress').length,
    critical: issues.filter((issue) => issue.status === 'critical').length,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-2xl"
              >
                {"\uD83C\uDFD9\uFE0F"}
              </motion.span>
              <h1 className="text-xl font-bold text-foreground">Civic Spark</h1>
            </div>
            <p className="text-xs text-muted-foreground">Verified local issue reporting</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="iconSm" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="iconSm" onClick={() => onNavigate('report')}>
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl gradient-gamification p-4 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">Daily Activity</span>
                <Badge className="bg-white/20 text-white text-[10px] border-white/30">Cloud-backed</Badge>
              </div>
              <p className="text-white/80 text-xs mt-0.5">Report issues, earn XP, and keep your streak alive.</p>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-lg">{statsData?.streak_days ?? 0}</div>
              <div className="text-white/70 text-xs">Day streak</div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(100, ((statsData?.xp ?? 0) / Math.max(1, statsData?.next_level_xp ?? 1)) * 100)}%` }}
            />
          </div>
        </motion.div>

        {uiUser && <UserStatsCard user={uiUser} onViewProfile={() => onNavigate('profile')} />}

        <QuickStats stats={stats} />

        <div>
          <h2 className="text-sm font-semibold mb-3">Filter by Category</h2>
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Issues</h2>
            <Button variant="link" className="text-xs h-auto p-0" onClick={() => onNavigate('map')}>
              View Map
            </Button>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading issues...</div>
          ) : issues.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              No issues yet. Submit the first verified report from the Report tab.
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onUpvote={(id) => upvoteIssue.mutate(Number(id))}
                  onView={() => onNavigate('map')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
