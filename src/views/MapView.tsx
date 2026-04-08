import { useMemo, useState } from 'react';
import { Icon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { AlertTriangle, Droplets, Filter, Lightbulb, MapPin, Navigation, TrafficCone, Trash2, Waves, X, ZoomIn, ZoomOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { useMapIssues, useTrackIssue, useUpdateIssueStatus, useUpvoteIssue } from '@/hooks/api/useIssues';
import { calculateIssuePriority } from '@/lib/priority';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '@/types/civic';
import 'leaflet/dist/leaflet.css';

const CATEGORY_META = {
  pothole: { label: 'Pothole', short: 'P', icon: AlertTriangle },
  streetlight: { label: 'Light', short: 'L', icon: Lightbulb },
  garbage: { label: 'Garbage', short: 'G', icon: Trash2 },
  water: { label: 'Water', short: 'W', icon: Droplets },
  traffic: { label: 'Traffic', short: 'T', icon: TrafficCone },
  other: { label: 'Other', short: 'O', icon: Waves },
} as const;

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'pothole', label: 'Pothole' },
  { id: 'streetlight', label: 'Streetlight' },
  { id: 'garbage', label: 'Garbage' },
  { id: 'water', label: 'Water' },
  { id: 'traffic', label: 'Traffic' },
] as const;

function createCustomMarkerIcon(color: string, icon: string) {
  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16C0 24 16 40 16 40C16 40 32 24 32 16C32 7.163 24.837 0 16 0Z" fill="${color}"/>
      <foreignObject x="0" y="6" width="32" height="28">
        <div xmlns="http://www.w3.org/1999/xhtml" style="text-align: center; font-size: 18px; line-height: 28px;">
          ${icon}
        </div>
      </foreignObject>
    </svg>
  `.trim();

  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

function MapControls({ map }: { map: any }) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
      <Button variant="secondary" size="icon" className="shadow-card bg-card text-primary border border-border" onClick={() => map?.zoomIn()}>
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button variant="secondary" size="icon" className="shadow-card bg-card text-primary border border-border" onClick={() => map?.zoomOut()}>
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="shadow-card bg-card text-primary border border-border"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition((position) => {
            map?.flyTo([position.coords.latitude, position.coords.longitude], 15);
          });
        }}
      >
        <Navigation className="w-4 h-4" />
      </Button>
    </div>
  );
}

function MapController() {
  const map = useMap();
  return <MapControls map={map} />;
}

export function MapView() {
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORY_OPTIONS)[number]['id']>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [mapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [mapZoom] = useState(12);

  const { data, isLoading } = useMapIssues(
    mapCenter[0] - 0.3,
    mapCenter[0] + 0.3,
    mapCenter[1] - 0.3,
    mapCenter[1] + 0.3,
    selectedCategory === 'all' ? undefined : selectedCategory,
  );
  const { data: currentUser } = useCurrentUser();
  const upvoteIssue = useUpvoteIssue();
  const trackIssue = useTrackIssue();
  const updateIssueStatus = useUpdateIssueStatus();

  const issues = useMemo(() => {
    return (data?.issues ?? []).filter((item) => {
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'resolved' ? item.status === 'resolved' : item.status !== 'resolved');
      const text = `${item.title} ${item.description} ${item.location.address}`.toLowerCase();
      const matchesSearch = !searchQuery.trim() || text.includes(searchQuery.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [data?.issues, searchQuery, selectedStatus]);
  const issue = issues.find((item) => item.id === selectedIssue) ?? null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      critical: '#ef4444',
      acknowledged: '#f97316',
      'in-progress': '#3b82f6',
      resolved: '#22c55e',
    };
    return colors[status] || '#6b7280';
  };

  const legendEntries = useMemo(() => Object.entries(STATUS_CONFIG), []);

  const canResolveIssue = Boolean(currentUser && issue && issue.reportedBy === currentUser.name && issue.status !== 'resolved');

  return (
    <div className="relative min-h-screen bg-muted pb-20">
      <header className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-card rounded-xl shadow-card px-4 py-3 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search location or issue..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <Button variant="default" size="icon" className="shadow-card" onClick={() => setShowFilters((value) => !value)}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {showFilters && (
          <>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {CATEGORY_OPTIONS.map((category) => {
                const meta = category.id === 'all' ? null : CATEGORY_META[category.id];
                const IconComponent = meta?.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-2 text-xs shadow-sm border transition-colors whitespace-nowrap',
                      isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border',
                    )}
                  >
                    {IconComponent ? <IconComponent className="h-3.5 w-3.5" /> : <span>•</span>}
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All statuses' },
                { id: 'open', label: 'Open issues' },
                { id: 'resolved', label: 'Resolved' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedStatus(option.id as 'all' | 'open' | 'resolved')}
                  className={cn(
                    'rounded-full px-3 py-2 text-xs border transition-colors whitespace-nowrap',
                    selectedStatus === option.id ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-card text-foreground border-border',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </header>

      <div className="absolute inset-0 w-full h-full z-0">
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', zIndex: 0 }} className="z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {issues.map((item) => {
            const category = CATEGORY_META[item.category as keyof typeof CATEGORY_META];
            const markerIcon = createCustomMarkerIcon(getStatusColor(item.status), category?.short || '!');
            const daysSinceReported = Math.max(1, Math.floor((Date.now() - new Date(item.reportedAt).getTime()) / (1000 * 60 * 60 * 24)));
            const priority = calculateIssuePriority(
              {
                id: String(item.id),
                title: item.title,
                description: item.description,
                category: item.category as any,
                status: item.status as any,
                location: item.location,
                upvotes: item.upvotes,
                reportedBy: item.reportedBy,
                reportedAt: new Date(item.reportedAt),
                imageUrl: item.imageUrl,
                hasUpvoted: item.hasUpvoted,
              },
              3,
              daysSinceReported,
            );

            return (
              <Marker
                key={item.id}
                position={[item.location.lat, item.location.lng]}
                icon={markerIcon}
                eventHandlers={{ click: () => setSelectedIssue(item.id) }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].color as any} className="text-xs">
                        {STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                      {item.isVerified && <span className="text-xs text-status-resolved">Verified</span>}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{item.location.address}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>Upvotes {item.upvotes}</span>
                      <span>Priority {priority}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <MapController />
        </MapContainer>
      </div>

      {issue && (
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-24 left-4 right-4 z-[1001]">
          <Card className="shadow-elevated">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Button variant="ghost" size="iconSm" className="absolute top-2 right-2" onClick={() => setSelectedIssue(null)}>
                  <X className="w-4 h-4" />
                </Button>
                {issue.imageUrl && <img src={issue.imageUrl} alt={issue.title} className="w-20 h-20 rounded-xl object-cover" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG].color as any} className="text-xs">
                      {STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{issue.upvotes} upvotes</span>
                    {issue.isVerified && <Badge variant="resolved" className="text-[10px]">AI verified</Badge>}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{issue.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {issue.location.address}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-9" onClick={() => upvoteIssue.mutate(issue.id)}>
                      {issue.hasUpvoted ? 'Upvoted' : 'Upvote'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-9" onClick={() => trackIssue.mutate(issue.id)}>
                      {issue.isTracked ? 'Tracking' : 'Track'}
                    </Button>
                  </div>
                  {canResolveIssue && (
                    <Button
                      size="sm"
                      variant="success"
                      className="mt-2 w-full h-9"
                      onClick={() => updateIssueStatus.mutate({ issueId: issue.id, status: 'resolved' })}
                    >
                      Close Issue
                    </Button>
                  )}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Verification: {issue.verificationStatus} · confidence {(issue.aiConfidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="absolute bottom-24 left-4 z-20">
        <Card className="shadow-card">
          <CardContent className="p-3">
            <p className="text-xs font-medium mb-2">Status Legend</p>
            <div className="space-y-1.5">
              {legendEntries.map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      key === 'critical' && 'bg-status-critical',
                      key === 'acknowledged' && 'bg-status-acknowledged',
                      key === 'in-progress' && 'bg-status-in-progress',
                      key === 'resolved' && 'bg-status-resolved',
                    )}
                  />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{issues.length} issue(s) visible</p>
            {isLoading && <p className="mt-2 text-[11px] text-muted-foreground">Loading map issues...</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
