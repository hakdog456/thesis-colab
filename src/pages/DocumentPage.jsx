import React, { useState } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { TaskSidebar } from '../components/tasks/TaskSidebar';
import { TaskDetailsPanel } from '../components/tasks/TaskDetailsPanel';
import { ThesisEditor } from '../components/editor/ThesisEditor';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { useData } from '../contexts/DataContext';

export function DocumentPage() {
  const { selectedTaskId, selectTask } = useData();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTargetForNewTask, setSelectedTargetForNewTask] = useState(null);

  const handleCreateTaskFromSelection = (targetMeta) => {
    setSelectedTargetForNewTask(targetMeta);
    setIsNewTaskModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppHeader />

      <div className="workspace-layout">
        {/* Left: Task List */}
        <aside className="workspace-sidebar">
          <TaskSidebar
            onNewTaskClick={() => {
              setSelectedTargetForNewTask(null);
              setIsNewTaskModalOpen(true);
            }}
          />
        </aside>

        {/* Center: Thesis Document (Dominates interface) */}
        <main className="workspace-center">
          <ThesisEditor
            onSelectTask={(taskId) => selectTask(taskId)}
            onRequestCreateTaskWithSelection={handleCreateTaskFromSelection}
          />
        </main>

        {/* Right: Small contextual task / review panel */}
        <aside className="workspace-panel">
          <TaskDetailsPanel onClose={() => selectTask(null)} />
        </aside>
      </div>

      <CreateTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setSelectedTargetForNewTask(null);
        }}
        initialTarget={selectedTargetForNewTask}
      />
    </div>
  );
}
