import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TASK_STATUS, getTaskColorMeta } from '../../utils/constants';
import { MessageSquare } from 'lucide-react';

export function TaskCard({ task, isSelected, onClick }) {
  const { getUser } = useAuth();
  const { tasks = [], comments = [] } = useData();
  const owner = task.ownerId ? getUser(task.ownerId) : null;
  const commentCount = comments.filter((comment) => comment.taskId === task.id).length;
  const taskColor = getTaskColorMeta(task, tasks);

  // Status color dot
  let dotColor = taskColor.color;
  if (task.status === TASK_STATUS.CHANGED) {
    dotColor = '#EAB308'; // yellow
  } else if (task.status === TASK_STATUS.CHANGES_REQUESTED) {
    dotColor = '#DC2626'; // red
  }

  return (
    <div
      className={`task-card-simple ${isSelected ? 'selected' : ''}`}
      style={{
        borderLeft: `4px solid ${taskColor.color}`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="task-status-dot"
            style={{ background: dotColor }}
          />
          <span className="task-card-title truncate">
            {task.title}
          </span>
        </div>
      </div>

      <div className="task-card-location mb-2">
        {task.target?.chapterId} &bull; {task.target?.sectionId}
      </div>

      <div className="flex items-center justify-between">
        <span className="task-card-owner">
          {owner ? owner.name : 'Unassigned'}
        </span>

        <div className="flex items-center gap-2">
          {commentCount > 0 && (
            <span className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              <MessageSquare size={12} />
              {commentCount}
            </span>
          )}
          <TaskStatusBadge status={task.status} />
        </div>
      </div>
    </div>
  );
}

