import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TASK_STATUS } from '../utils/constants';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GitPullRequest,
  PenTool,
  Plus,
  Sparkles,
  Users,
  ArrowRight,
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tasks, changeRequests, versions, document, selectTask } = useData();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const myTasks = tasks.filter((t) => t.ownerId === currentUser?.id && t.status !== TASK_STATUS.DONE);
  const forReviewTasks = tasks.filter((t) => t.status === TASK_STATUS.FOR_REVIEW);
  const completedTasks = tasks.filter((t) => t.status === TASK_STATUS.DONE);
  const pendingCRs = changeRequests.filter((cr) => cr.status === 'pending');

  const handleOpenTask = (taskId) => {
    selectTask(taskId);
    navigate('/document/doc-1');
  };

  return (
    <div className="dashboard">
      {/* Greeting Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="dashboard__greeting">
            Hello, <span style={{ color: currentUser?.color }}>{currentUser?.name || 'User'}</span>
          </h1>
          <p className="dashboard__subtitle">
            Collaborative thesis environment &bull; {document?.title}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="btn btn-secondary"
            onClick={() => setIsNewTaskModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => navigate('/document/doc-1')}
          >
            <BookOpen size={16} />
            <span>Open Thesis Document</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__value" style={{ color: 'var(--color-dustin)' }}>
            {myTasks.length}
          </div>
          <div className="stat-card__label">My Active Tasks</div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-card__value" style={{ color: 'var(--color-kyran)' }}>
            {pendingCRs.length}
          </div>
          <div className="stat-card__label">Pending Change Requests</div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__value" style={{ color: 'var(--color-renz)' }}>
            {completedTasks.length}
          </div>
          <div className="stat-card__label">Merged Changes</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__value">v{versions.length}</div>
          <div className="stat-card__label">Official Document Version</div>
        </div>
      </div>

      {/* Main Grid: My Tasks & Change Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
        {/* Left: My Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>My Assigned Tasks</h2>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
              {myTasks.length} in progress
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {myTasks.length > 0 ? (
              myTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={false}
                  onClick={() => handleOpenTask(task.id)}
                />
              ))
            ) : (
              <div className="empty-state" style={{ padding: 'var(--sp-6)' }}>
                <PenTool size={24} className="empty-state__icon" />
                <p className="empty-state__text">No tasks assigned to you right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Change Requests Ready for Peer Review */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>Pending Change Requests</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/review')}
            >
              View all &rarr;
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {pendingCRs.length > 0 ? (
              pendingCRs.map((cr) => (
                <div
                  key={cr.id}
                  className="card card-interactive"
                  style={{ padding: '12px' }}
                  onClick={() => navigate(`/review/${cr.id}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                      {cr.taskTitle}
                    </span>
                    <span className="badge badge-for-review">Review</span>
                  </div>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {cr.changeSummary}
                  </p>
                  <div className="flex items-center justify-between" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    <span>{cr.targetSection}</span>
                    <span>{new Date(cr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: 'var(--sp-6)' }}>
                <CheckCircle2 size={24} className="empty-state__icon" />
                <p className="empty-state__text">All change requests reviewed and merged!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Architectural Guidelines Banner */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={20} color="var(--accent-primary)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
              Official Document Isolation Active
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
              Edits happen in isolated working copies and only apply to the official thesis upon peer approval.
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/document/doc-1')}
        >
          View Thesis
        </button>
      </div>

      {/* New Task Modal */}
      <CreateTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />
    </div>
  );
}
