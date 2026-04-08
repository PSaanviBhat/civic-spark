/**
 * Issue Categories
 */

export enum IssueCategory {
  POTHOLE = 'pothole',
  STREETLIGHT = 'streetlight',
  GARBAGE = 'garbage',
  WATER = 'water',
  TRAFFIC = 'traffic',
  OTHER = 'other',
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.POTHOLE]: 'Pothole',
  [IssueCategory.STREETLIGHT]: 'Street Light',
  [IssueCategory.GARBAGE]: 'Garbage',
  [IssueCategory.WATER]: 'Water Issue',
  [IssueCategory.TRAFFIC]: 'Traffic',
  [IssueCategory.OTHER]: 'Other',
};

export const CATEGORY_COLORS: Record<IssueCategory, string> = {
  [IssueCategory.POTHOLE]: 'bg-red-500',
  [IssueCategory.STREETLIGHT]: 'bg-yellow-500',
  [IssueCategory.GARBAGE]: 'bg-amber-600',
  [IssueCategory.WATER]: 'bg-blue-500',
  [IssueCategory.TRAFFIC]: 'bg-orange-500',
  [IssueCategory.OTHER]: 'bg-gray-500',
};

export const CATEGORY_ICONS: Record<IssueCategory, string> = {
  [IssueCategory.POTHOLE]: '🕳️',
  [IssueCategory.STREETLIGHT]: '💡',
  [IssueCategory.GARBAGE]: '🗑️',
  [IssueCategory.WATER]: '💧',
  [IssueCategory.TRAFFIC]: '🚗',
  [IssueCategory.OTHER]: '📌',
};
