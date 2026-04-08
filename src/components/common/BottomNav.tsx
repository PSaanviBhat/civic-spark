import { motion } from 'framer-motion';
import { Map, PlusCircle, Trophy, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'home' | 'map' | 'report' | 'leaderboard' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'report', icon: PlusCircle, label: 'Report' },
  { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-elevated">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isReport = item.id === 'report';
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200",
                isReport 
                  ? "gradient-hero text-primary-foreground shadow-card -mt-6 px-5 py-3"
                  : isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && !isReport && (
                <motion.div
                  layoutId="activeTab"
                  className="pointer-events-none absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon className={cn("relative z-10", isReport ? "w-6 h-6" : "w-5 h-5")} />
              <span className={cn("relative z-10 text-xs font-medium", isReport && "text-primary-foreground")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
