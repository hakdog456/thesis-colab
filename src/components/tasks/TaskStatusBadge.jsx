import React from 'react';
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_STATUS_BADGE_CLASS } from '../../utils/constants';

export function TaskStatusBadge({ status }) {
  const label = TASK_STATUS_LABELS[status] || status;
  const badgeClass = TASK_STATUS_BADGE_CLASS[status] || 'badge-available';

  return (
    <span className={`badge ${badgeClass}`}>
      {label}
    </span>
  );
}
