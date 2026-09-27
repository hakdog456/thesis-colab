// Simplified Task Statuses (Section 2)
export const TASK_STATUS = {
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  CHANGED: 'changed',
  CHANGES_REQUESTED: 'changes_requested',
  REVIEWED: 'reviewed',
  DONE: 'done',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.AVAILABLE]: 'Available',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.CHANGED]: 'Changed',
  [TASK_STATUS.CHANGES_REQUESTED]: 'Changes Requested',
  [TASK_STATUS.REVIEWED]: 'Reviewed',
  [TASK_STATUS.DONE]: 'Done',
};

export const TASK_STATUS_BADGE_CLASS = {
  [TASK_STATUS.AVAILABLE]: 'badge-available',
  [TASK_STATUS.IN_PROGRESS]: 'badge-in-progress',
  [TASK_STATUS.CHANGED]: 'badge-changed',
  [TASK_STATUS.CHANGES_REQUESTED]: 'badge-changes-requested',
  [TASK_STATUS.REVIEWED]: 'badge-reviewed',
  [TASK_STATUS.DONE]: 'badge-done',
};

// Priority levels
export const PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const PRIORITY_LABELS = {
  [PRIORITY.CRITICAL]: 'Critical',
  [PRIORITY.HIGH]: 'High',
  [PRIORITY.MEDIUM]: 'Medium',
  [PRIORITY.LOW]: 'Low',
};

// User color mapping
export const USER_COLORS = {
  'user-dustin': { color: '#2563EB', raw: '#2563EB', class: 'blue', name: 'Dustin' },
  'user-kyran':  { color: '#7C3AED', raw: '#7C3AED', class: 'purple', name: 'Kyran' },
  'user-renz':   { color: '#059669', raw: '#059669', class: 'green', name: 'Renz' },
};

// Distinct Task Colors (Section 5 - Unique color per task)
export const TASK_COLORS = [
  { id: 'blue', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.18)', border: '#2563EB', name: 'Blue' },
  { id: 'purple', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.18)', border: '#7C3AED', name: 'Purple' },
  { id: 'emerald', color: '#059669', bg: 'rgba(5, 150, 105, 0.18)', border: '#059669', name: 'Emerald' },
  { id: 'amber', color: '#D97706', bg: 'rgba(217, 119, 6, 0.18)', border: '#D97706', name: 'Amber' },
  { id: 'rose', color: '#E11D48', bg: 'rgba(225, 29, 72, 0.18)', border: '#E11D48', name: 'Rose' },
  { id: 'teal', color: '#0D9488', bg: 'rgba(13, 148, 136, 0.18)', border: '#0D9488', name: 'Teal' },
  { id: 'indigo', color: '#4F46E5', bg: 'rgba(79, 70, 229, 0.18)', border: '#4F46E5', name: 'Indigo' },
  { id: 'cyan', color: '#0891B2', bg: 'rgba(8, 145, 178, 0.18)', border: '#0891B2', name: 'Cyan' },
];

export function getTaskColorMeta(task, allTasks = []) {
  if (!task) return TASK_COLORS[0];
  if (task.color) {
    const found = TASK_COLORS.find((c) => c.id === task.color);
    if (found) return found;
  }
  let index = 0;
  if (Array.isArray(allTasks) && allTasks.length > 0) {
    const idx = allTasks.findIndex((t) => t.id === task.id);
    if (idx !== -1) index = idx;
  }
  if (index === 0 && task.id) {
    let hash = 0;
    for (let i = 0; i < task.id.length; i++) {
      hash = (hash << 5) - hash + task.id.charCodeAt(i);
      hash |= 0;
    }
    index = Math.abs(hash);
  }
  return TASK_COLORS[index % TASK_COLORS.length];
}

// Legacy compatibility exports
export const CHANGE_TYPE = {
  EDIT: 'edit',
  DELETE: 'delete',
};

export const CR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested',
};

