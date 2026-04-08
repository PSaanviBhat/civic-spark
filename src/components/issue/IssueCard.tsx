import { motion } from 'framer-motion';
import { ArrowUp, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Issue, CATEGORIES, STATUS_CONFIG } from '@/types/civic';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
  onUpvote?: (id: string) => void;
  onView?: (id: string) => void;
}

export function IssueCard({ issue, onUpvote, onView }: IssueCardProps) {
  const category = CATEGORIES.find(c => c.id === issue.category);
  const statusConfig = STATUS_CONFIG[issue.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-elevated transition-all duration-300 cursor-pointer">
        <CardContent className="p-0">
          <div className="flex">
            {/* Image section */}
            {issue.imageUrl && (
              <div className="relative w-28 h-full min-h-[120px] flex-shrink-0">
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-xl">{category?.icon}</span>
                </div>
              </div>
            )}

            {/* Content section */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {!issue.imageUrl && (
                    <span className="text-xl">{category?.icon}</span>
                  )}
                  <Badge variant={statusConfig.color as any} className="text-xs">
                    {statusConfig.label}
                  </Badge>
                  {issue.status === 'resolved' && (
                    <Badge variant="resolved" className="text-[10px]">Closed</Badge>
                  )}
                </div>
                <button 
                  onClick={() => onView?.(issue.id)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{issue.title}</h3>
              
              <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{issue.location.address}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(issue.reportedAt, { addSuffix: true })}</span>
                </div>

                <Button
                  variant={issue.hasUpvoted ? "upvoted" : "upvote"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpvote?.(issue.id);
                  }}
                  className="h-8 px-3 gap-1"
                >
                  <ArrowUp className={cn("w-3.5 h-3.5", issue.hasUpvoted && "fill-current")} />
                  <span className="font-bold">{issue.upvotes}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
