import { useState } from 'react';
import { apiClient } from '@/api/client';
import { BottomNav } from '@/components/common';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { AuthView } from '@/views/AuthView';
import { HomeView } from '@/views/HomeView';
import { MapView } from '@/views/MapView';
import { ReportView } from '@/views/ReportView';
import { LeaderboardView } from '@/views/LeaderboardView';
import { ProfileView } from '@/views/ProfileView';

type Tab = 'home' | 'map' | 'report' | 'leaderboard' | 'profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const token = apiClient.getToken();
  const { data: currentUser, isLoading } = useCurrentUser();

  if (!token) {
    return <AuthView />;
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading your workspace...</div>;
  }

  if (!currentUser) {
    apiClient.clearToken();
    return <AuthView />;
  }

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onNavigate={setActiveTab} />;
      case 'map':
        return <MapView />;
      case 'report':
        return <ReportView onBack={() => setActiveTab('home')} />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <HomeView onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-background min-h-screen relative">
      {renderView()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
