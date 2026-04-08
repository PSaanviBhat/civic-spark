import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry } from '@/types/civic';
import { cn } from '@/lib/utils';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardList({ entries, currentUserId }: LeaderboardListProps) {
  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getChangeIcon = (change?: number) => {
    if (!change || change === 0) return <Minus className="w-3 h-3 text-muted-foreground" />;
    if (change > 0) return <TrendingUp className="w-3 h-3 text-status-resolved" />;
    return <TrendingDown className="w-3 h-3 text-status-critical" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Top Contributors</CardTitle>
          <Badge variant="level" className="text-xs">This Week</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.user.id === currentUserId;
            
            return (
              <motion.div
                key={entry.user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                  isCurrentUser 
                    ? "bg-primary/10 border-2 border-primary/20" 
                    : "hover:bg-muted/50"
                )}
              >
                {/* Rank */}
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                  getRankStyles(entry.rank)
                )}>
                  {entry.rank}
                </div>

                {/* Avatar */}
                <div className="relative">
                  <img
                    src={entry.user.avatar}
                    alt={entry.user.name}
                    className="w-10 h-10 rounded-full border-2 border-border"
                  />
                  {entry.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 text-sm">
                      {entry.rank === 1 && '👑'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-semibold text-sm truncate",
                      isCurrentUser && "text-primary"
                    )}>
                      {entry.user.name}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">You</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{entry.user.levelName}</span>
                </div>

                {/* Points & Change */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-bold text-sm">{entry.points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                  <div className="w-4 flex items-center justify-center">
                    {getChangeIcon(entry.change)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
