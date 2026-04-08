import { motion } from 'framer-motion';
import { CATEGORIES, IssueCategory } from '@/types/civic';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selected: IssueCategory | 'all';
  onSelect: (category: IssueCategory | 'all') => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const categories = [{ id: 'all' as const, label: 'All', icon: '📍' }, ...CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isSelected = selected === category.id;
        
        return (
          <motion.button
            key={category.id}
            onClick={() => onSelect(category.id)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 text-sm font-medium",
              isSelected
                ? "gradient-hero text-primary-foreground shadow-card"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
