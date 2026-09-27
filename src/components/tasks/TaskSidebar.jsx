import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TaskCard } from './TaskCard';
import { TASK_STATUS } from '../../utils/constants';
import { navigateToBlock } from '../../utils/documentPositions';
import { Plus, Search } from 'lucide-react';

export function TaskSidebar({ onNewTaskClick }) {
  const { currentUser } = useAuth();
  const { tasks, selectedTaskId, selectTask, addToast } = useData();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'my' | 'changed'

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        task.title.toLowerCase().includes(term) ||
        task.target?.sectionId?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term);
      if (!match) return false;
    }

    // Tab filter
    if (activeFilter === 'my') {
      return task.ownerId === currentUser?.id;
    }
    if (activeFilter === 'changed') {
      return task.status === TASK_STATUS.CHANGED || task.status === TASK_STATUS.CHANGES_REQUESTED;
    }
    return true;
  });

  const handleTaskClick = (task) => {
    selectTask(task.id);

    // Navigate to the task's block — editing starts from the detail panel
    if (task.target?.blockId) {
      const result = navigateToBlock(task.target.blockId);
      if (!result.success) {
        addToast('Target not found. This task needs attention.', 'error');
      }
    }
  };

  const changedCount = tasks.filter((t) => (
    t.status === TASK_STATUS.CHANGED || t.status === TASK_STATUS.CHANGES_REQUESTED
  )).length;

  return (
    <div className="task-sidebar-simple">
      {/* Sidebar Header */}
      <div className="sidebar-header-simple">
        <div className="flex items-center justify-between mb-3">
          <span className="sidebar-title">Tasks</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onNewTaskClick}
            title="Create Task"
          >
            <Plus size={13} />
            <span>New Task</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            className="input"
            placeholder="Filter tasks..."
            style={{ paddingLeft: 30, fontSize: '12px', height: 30 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Clean Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button
            className={`filter-tab ${activeFilter === 'my' ? 'active' : ''}`}
            onClick={() => setActiveFilter('my')}
          >
            My Tasks
          </button>
          <button
            className={`filter-tab ${activeFilter === 'changed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('changed')}
          >
            Changed {changedCount > 0 && `(${changedCount})`}
          </button>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="sidebar-task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={task.id === selectedTaskId}
              onClick={() => handleTaskClick(task)}
            />
          ))
        ) : (
          <div className="empty-state-simple">
            No tasks match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
