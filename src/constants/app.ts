/**
 * Application Constants
 */

// Level configuration
export const LEVEL_THRESHOLDS = {
  1: { min: 0, max: 100, label: 'Novice' },
  2: { min: 100, max: 300, label: 'Reporter' },
  3: { min: 300, max: 700, label: 'Champion' },
  4: { min: 700, max: 1500, label: 'Guardian' },
  5: { min: 1500, max: Infinity, label: 'Legend' },
};

export const MAX_LEVEL = 5;

// XP Rewards
export const XP_REWARDS = {
  REPORT_ISSUE: 20,
  UPVOTE_RECEIVED: 2,
  PHOTO_EVIDENCE: 10,
  ISSUE_RESOLVED: 15,
  DAILY_LOGIN: 5,
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  DEFAULT_SKIP: 0,
};

// Map
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 12,
  DEFAULT_LAT: 12.9716,
  DEFAULT_LNG: 77.5946,
  BBOX_PADDING: 0.05,
};

// Time formats
export const TIME_FORMAT = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy HH:mm',
  RELATIVE: 'relative', // "2 hours ago"
};

// Issue status
export enum IssueStatus {
  CRITICAL = 'critical',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
}

export const STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.CRITICAL]: 'Critical',
  [IssueStatus.ACKNOWLEDGED]: 'Acknowledged',
  [IssueStatus.IN_PROGRESS]: 'In Progress',
  [IssueStatus.RESOLVED]: 'Resolved',
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  [IssueStatus.CRITICAL]: 'bg-red-600',
  [IssueStatus.ACKNOWLEDGED]: 'bg-yellow-500',
  [IssueStatus.IN_PROGRESS]: 'bg-blue-500',
  [IssueStatus.RESOLVED]: 'bg-green-500',
};
