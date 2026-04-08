import { motion } from 'framer-motion';
import { Badge } from '@/types/civic';
import { cn } from '@/lib/utils';

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const earnedBadges = badges.filter(b => b.isEarned);
  const unearnedBadges = badges.filter(b => !b.isEarned);

  return (
    <div className="space-y-4">
      {/* Earned badges */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Earned Badges ({earnedBadges.length})</h3>
        <div className="grid grid-cols-3 gap-3">
          {earnedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-xp-gold/10 to-xp-gold/5 border-2 border-xp-gold/20"
            >
              <div className="text-3xl mb-2 animate-float">{badge.icon}</div>
              <span className="text-xs font-medium text-center text-foreground">{badge.name}</span>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-xp-gold flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                ✓
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unearned badges */}
      {unearnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Locked Badges</h3>
          <div className="grid grid-cols-3 gap-3">
            {unearnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (earnedBadges.length + index) * 0.1 }}
                className={cn(
                  "flex flex-col items-center p-4 rounded-2xl bg-muted/50 border-2 border-muted",
                  "opacity-50 grayscale"
                )}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <span className="text-xs font-medium text-center text-muted-foreground">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
