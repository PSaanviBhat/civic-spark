import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Globe, Trophy, Users } from 'lucide-react';

import { LeaderboardList } from '@/components/gamification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { useLeaderboard } from '@/hooks/api/useGamification';
import { getAvatarUrl, toUiLeaderboardEntry } from '@/lib/adapters';
import { cn } from '@/lib/utils';

type LeaderboardScope = 'global' | 'local' | 'friends';

export function LeaderboardView() {
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const { data: leaderboardData, isLoading } = useLeaderboard(20, 0);
  const { data: currentUser } = useCurrentUser();

  const entries = useMemo(() => (leaderboardData?.entries ?? []).map(toUiLeaderboardEntry), [leaderboardData]);
  const scopes: { id: LeaderboardScope; label: string; icon: typeof Globe }[] = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'local', label: 'Local', icon: Users },
    { id: 'friends', label: 'Friends', icon: Users },
  ];

  const podium = entries.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-hero text-primary-foreground">
        <div className="px-4 py-6 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-primary-foreground/80 text-sm">Live civic rankings powered by your backend.</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {scopes.map((item) => (
              <Button
                key={item.id}
                variant={scope === item.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setScope(item.id)}
                className={cn(
                  'flex-1',
                  scope === item.id ? 'bg-white/20 text-white hover:bg-white/30' : 'text-white/70 hover:text-white hover:bg-white/10',
                )}
              >
                <item.icon className="w-4 h-4 mr-1.5" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-4 -mb-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-elevated p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-gamification flex items-center justify-center text-2xl font-bold text-accent-foreground shadow-glow-accent">
                #{leaderboardData?.current_user_rank ?? '-'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Your Ranking</span>
                  {currentUser && <Badge variant="level" className="text-xs">Level {currentUser.level}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentUser ? `${currentUser.xp.toLocaleString()} XP` : 'Sign in to see your live rank'}
                </p>
              </div>
              {currentUser && (
                <img
                  src={getAvatarUrl(currentUser.name)}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full border-2 border-primary"
                />
              )}
            </div>
          </motion.div>
        </div>
      </header>

      <div className="px-4 py-4 pt-12 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Rankings</h2>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            This Week
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        {podium.length > 0 && (
          <div className="flex items-end justify-center gap-4 py-6">
            {podium.map((entry) => (
              <motion.div
                key={entry.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <img src={entry.user.avatar} alt={entry.user.name} className="w-14 h-14 rounded-full border-4 border-primary/20 mb-2" />
                <span className="text-xs font-medium text-center truncate max-w-[80px]">{entry.user.name.split(' ')[0]}</span>
                <Badge variant={entry.rank === 1 ? 'xp' : 'outline'} className="mt-1 text-[10px]">
                  #{entry.rank} {entry.points}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading leaderboard...</div>
        ) : (
          <LeaderboardList entries={entries} currentUserId={currentUser ? String(currentUser.id) : undefined} />
        )}
      </div>
    </div>
  );
}
