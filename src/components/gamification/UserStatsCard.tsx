import { motion } from 'framer-motion';
import { Flame, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, LEVELS } from '@/types/civic';
import { cn } from '@/lib/utils';

interface UserStatsCardProps {
  user: User;
  onViewProfile?: () => void;
}

export function UserStatsCard({ user, onViewProfile }: UserStatsCardProps) {
  const currentLevel = LEVELS.find(l => l.level === user.level);
  const nextLevel = LEVELS.find(l => l.level === user.level + 1);
  const progressToNext = nextLevel 
    ? ((user.xp - (currentLevel?.minXP || 0)) / ((nextLevel?.minXP || user.xp) - (currentLevel?.minXP || 0))) * 100
    : 100;

  const levelColors = [
    'from-level-citizen to-level-citizen/70',
    'from-level-reporter to-level-reporter/70',
    'from-level-helper to-level-helper/70',
    'from-level-leader to-level-leader/70',
    'from-level-champion to-level-champion/70',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl shadow-elevated"
    >
      {/* Gradient background */}
      <div className={cn(
        "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
        levelColors[user.level - 1] || levelColors[0]
      )} />
      
      {/* Pattern overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full border-3 border-white/30 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-white border border-white/30">
                {user.level}
              </div>
            </div>
            <div className="text-white">
              <h3 className="text-lg font-bold">{user.name}</h3>
              <p className="text-white/80 text-sm">{user.levelName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium">{user.streak} day streak</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onViewProfile}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-white/90 text-sm mb-2">
            <span className="font-medium">{user.xp} XP</span>
            {nextLevel && (
              <span className="text-white/70">{nextLevel.minXP} XP for {nextLevel.name}</span>
            )}
          </div>
          <div className="relative">
            <Progress value={progressToNext} variant="xp" className="h-3 bg-white/20" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Badge variant="xp" className="text-xs px-3 py-1">
            🏆 Rank #{user.rank}
          </Badge>
          <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1">
            📋 {user.issuesReported} reported
          </Badge>
          <Badge className="bg-white/20 text-white border-white/30 text-xs px-3 py-1">
            ✅ {user.issuesResolved} resolved
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
