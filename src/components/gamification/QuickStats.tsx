import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickStatsProps {
  stats: {
    totalIssues: number;
    resolved: number;
    inProgress: number;
    critical: number;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  const items = [
    { label: 'Total', value: stats.totalIssues, icon: MapPin, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-status-resolved', bg: 'bg-status-resolved/10' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-status-in-progress', bg: 'bg-status-in-progress/10' },
    { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-status-critical', bg: 'bg-status-critical/10' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-2`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="text-lg font-bold">{item.value}</div>
              <div className="text-[10px] text-muted-foreground">{item.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
