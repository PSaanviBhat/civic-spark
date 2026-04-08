import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronDown, Flame, HelpCircle, LogOut, Settings, Shield } from 'lucide-react';

import { BadgeGrid } from '@/components/gamification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/api/client';
import { useCurrentUser, useLogout } from '@/hooks/api/useAuth';
import { useGamificationStats } from '@/hooks/api/useGamification';
import { getAvatarUrl } from '@/lib/adapters';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    key: 'notifications',
    icon: Bell,
    label: 'Notifications',
    badge: 'Live',
    description: 'Manage alerts for updates on reported and tracked issues.',
  },
  {
    key: 'privacy',
    icon: Shield,
    label: 'Privacy & Security',
    description: 'Control what profile details are visible and review account safety details.',
  },
  {
    key: 'support',
    icon: HelpCircle,
    label: 'Help & Support',
    description: 'Get quick help for reporting, tracking, and verification issues.',
  },
  {
    key: 'settings',
    icon: Settings,
    label: 'Settings',
    description: 'Basic app preferences for the current device and session.',
  },
] as const;

type MenuKey = (typeof menuItems)[number]['key'];

export function ProfileView() {
  const { data: currentUser } = useCurrentUser();
  const { data: stats } = useGamificationStats();
  const logout = useLogout();
  const [expandedSection, setExpandedSection] = useState<MenuKey | null>('notifications');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [issueUpdatesEnabled, setIssueUpdatesEnabled] = useState(true);
  const [profileVisible, setProfileVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [autoRefreshMap, setAutoRefreshMap] = useState(true);

  if (!currentUser || !stats) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading profile...</div>;
  }

  const progressToNext = stats.next_level_xp > 0 ? Math.min(100, (stats.xp / stats.next_level_xp) * 100) : 100;

  const renderSectionContent = (key: MenuKey) => {
    switch (key) {
      case 'notifications':
        return (
          <div className="space-y-3 pt-3">
            {[
              ['Push notifications', pushEnabled, setPushEnabled],
              ['Email summaries', emailEnabled, setEmailEnabled],
              ['Issue status updates', issueUpdatesEnabled, setIssueUpdatesEnabled],
            ].map(([label, value, setter]) => (
              <div key={label as string} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">{label as string}</p>
                  <p className="text-xs text-muted-foreground">Receive updates directly from the app.</p>
                </div>
                <button
                  type="button"
                  onClick={() => (setter as (value: boolean) => void)(!(value as boolean))}
                  className={cn(
                    'h-7 w-12 rounded-full transition-colors',
                    value ? 'bg-primary' : 'bg-border',
                  )}
                >
                  <span
                    className={cn(
                      'block h-5 w-5 rounded-full bg-white transition-transform',
                      value ? 'translate-x-6' : 'translate-x-1',
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-3 pt-3">
            <div className="rounded-xl bg-muted/60 px-3 py-3">
              <p className="text-sm font-medium">Account identity</p>
              <p className="text-xs text-muted-foreground mt-1">{currentUser.phone_or_email}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-3">
              <div>
                <p className="text-sm font-medium">Show public profile</p>
                <p className="text-xs text-muted-foreground">Display your contributor name on public leaderboards.</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileVisible((value) => !value)}
                className={cn('h-7 w-12 rounded-full transition-colors', profileVisible ? 'bg-primary' : 'bg-border')}
              >
                <span className={cn('block h-5 w-5 rounded-full bg-white transition-transform', profileVisible ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-3">
              <div>
                <p className="text-sm font-medium">Attach live location by default</p>
                <p className="text-xs text-muted-foreground">Keep current coordinates enabled when creating reports.</p>
              </div>
              <button
                type="button"
                onClick={() => setLocationVisible((value) => !value)}
                className={cn('h-7 w-12 rounded-full transition-colors', locationVisible ? 'bg-primary' : 'bg-border')}
              >
                <span className={cn('block h-5 w-5 rounded-full bg-white transition-transform', locationVisible ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-3 pt-3">
            <div className="rounded-xl bg-muted/60 px-3 py-3">
              <p className="text-sm font-medium">Need help with a report?</p>
              <p className="text-xs text-muted-foreground mt-1">Include a clear title, photo evidence, and allow location access for best verification results.</p>
            </div>
            <div className="rounded-xl bg-muted/60 px-3 py-3">
              <p className="text-sm font-medium">Support email</p>
              <p className="text-xs text-muted-foreground mt-1">soniaa.sharma.in@gmail.com</p>
            </div>
            <div className="rounded-xl bg-muted/60 px-3 py-3">
              <p className="text-sm font-medium">App health check</p>
              <p className="text-xs text-muted-foreground mt-1">Backend API and upload flow are active on your current local setup.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-3">
              <div>
                <p className="text-sm font-medium">Compact profile layout</p>
                <p className="text-xs text-muted-foreground">Reduce spacing in profile cards on smaller screens.</p>
              </div>
              <button
                type="button"
                onClick={() => setCompactMode((value) => !value)}
                className={cn('h-7 w-12 rounded-full transition-colors', compactMode ? 'bg-primary' : 'bg-border')}
              >
                <span className={cn('block h-5 w-5 rounded-full bg-white transition-transform', compactMode ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-3">
              <div>
                <p className="text-sm font-medium">Auto-refresh map issues</p>
                <p className="text-xs text-muted-foreground">Keep fetching fresh issue markers while using the map screen.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoRefreshMap((value) => !value)}
                className={cn('h-7 w-12 rounded-full transition-colors', autoRefreshMap ? 'bg-primary' : 'bg-border')}
              >
                <span className={cn('block h-5 w-5 rounded-full bg-white transition-transform', autoRefreshMap ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
            <div className="rounded-xl bg-muted/60 px-3 py-3">
              <p className="text-sm font-medium">Current environment</p>
              <p className="text-xs text-muted-foreground mt-1">Local development connected to your Docker API and AWS upload bucket.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-hero text-primary-foreground">
        <div className="px-4 py-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Profile</h1>
            <Button
              variant="ghost"
              size="iconSm"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => {
                setExpandedSection('settings');
                window.setTimeout(() => {
                  document.getElementById('profile-settings-section')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }, 50);
              }}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={getAvatarUrl(currentUser.name)}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl border-4 border-white/30 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full gradient-gamification flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {currentUser.level}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentUser.name}</h2>
              <p className="text-primary-foreground/80">{currentUser.phone_or_email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium">{stats.streak_days} day streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10">
        <Card className="shadow-elevated">
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.issues_reported}</div>
                <div className="text-xs text-muted-foreground">Reported</div>
              </div>
              <div className="border-x border-border">
                <div className="text-2xl font-bold text-secondary">{stats.issues_resolved}</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">XP {stats.xp}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={cn('px-4 py-4 space-y-4', compactMode && 'space-y-3')}>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Experience Points</h3>
                <p className="text-sm text-muted-foreground">{stats.xp} / {stats.next_level_xp} XP</p>
              </div>
              <Badge variant="level" className="text-sm px-3 py-1">
                Level {stats.level}
              </Badge>
            </div>
            <Progress value={progressToNext} variant="xp" className="h-4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Badges</CardTitle>
              <Badge variant="outline" className="text-xs">
                {stats.badges_earned}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <BadgeGrid badges={[]} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2" id="profile-settings-section">
            {menuItems.map((item, index) => {
              const isOpen = expandedSection === item.key;
              return (
                <div key={item.key} className={cn(index < menuItems.length - 1 && 'border-b border-border')}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExpandedSection(isOpen ? null : item.key)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block font-medium text-sm">{item.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{item.description}</span>
                    </div>
                    {item.badge && <Badge variant="outline" className="text-[10px] mr-1">{item.badge}</Badge>}
                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                  </motion.button>
                  {isOpen && <div className="px-3 pb-3">{renderSectionContent(item.key)}</div>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            logout();
            apiClient.clearToken();
            window.location.reload();
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
