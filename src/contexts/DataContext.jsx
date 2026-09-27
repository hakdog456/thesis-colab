import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { currentUser } = useAuth();

  // Core state
  const [document, setDocument] = useState(() => dataService.getDocument('doc-1'));
  const [tasks, setTasks] = useState(() => dataService.getTasks('doc-1'));
  const [versions, setVersions] = useState(() => dataService.getVersionHistory('doc-1'));
  const [changeRecords, setChangeRecords] = useState(() => dataService.getChangeRecords('doc-1'));
  const [comments, setComments] = useState(() => dataService.getComments());

  // Navigation & Editing state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Setup real-time listeners with Firebase Firestore
  useEffect(() => {
    const unsubDoc = dataService.subscribeToDocument((updatedDoc) => {
      setDocument(JSON.parse(JSON.stringify(updatedDoc)));
    });
    const unsubTasks = dataService.subscribeToTasks((updatedTasks) => {
      setTasks(JSON.parse(JSON.stringify(updatedTasks)));
    });
    const unsubVersions = dataService.subscribeToVersions((updatedVersions) => {
      setVersions(JSON.parse(JSON.stringify(updatedVersions)));
    });
    const unsubComments = dataService.subscribeToComments((updatedComments) => {
      setComments(JSON.parse(JSON.stringify(updatedComments)));
    });
    const unsubRecords = dataService.subscribeToChangeRecords((updatedRecords) => {
      setChangeRecords(JSON.parse(JSON.stringify(updatedRecords)));
    });

    return () => {
      unsubDoc();
      unsubTasks();
      unsubVersions();
      unsubComments();
      unsubRecords();
    };
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(() => {
    setDocument(dataService.getDocument('doc-1'));
    setTasks(dataService.getTasks('doc-1'));
    setVersions(dataService.getVersionHistory('doc-1'));
    setChangeRecords(dataService.getChangeRecords('doc-1'));
    setComments(dataService.getComments());
  }, []);

  const selectTask = useCallback((taskId) => {
    setSelectedTaskId(taskId);
  }, []);

  const claimTask = useCallback((taskId) => {
    try {
      const updated = dataService.claimTask(taskId, currentUser.id);
      setSelectedTaskId(taskId);
      addToast(`Claimed task "${updated.title}"`, 'success');
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [currentUser, addToast]);

  const releaseTask = useCallback((taskId) => {
    try {
      const updated = dataService.releaseTask(taskId, currentUser.id);
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }
      addToast(`Released task "${updated.title}"`, 'info');
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [currentUser, editingTaskId, addToast]);

  const dropTask = useCallback((taskId, reason = '') => {
    try {
      const updated = dataService.dropTask(taskId, currentUser.id, reason);
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }
      addToast(`Dropped task "${updated.title}"`, 'info');
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [currentUser, editingTaskId, addToast]);

  const startEditingTask = useCallback((taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.ownerId && task.ownerId !== currentUser.id) {
      addToast(`Only the assigned owner can edit this task. You can only view it.`, 'error');
      return;
    }

    if (!task.ownerId) {
      addToast('Claim this task first before editing.', 'info');
      return;
    }

    setEditingTaskId(taskId);
    setSelectedTaskId(taskId);
  }, [currentUser, tasks, addToast]);

  const stopEditingTask = useCallback(() => {
    setEditingTaskId(null);
  }, []);

  const saveOfficialChange = useCallback((taskId, newContent) => {
    try {
      const result = dataService.saveOfficialDocumentChange(taskId, newContent, currentUser.id);
      return result;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [currentUser, addToast]);

  const markTaskReviewed = useCallback((taskId) => {
    try {
      const result = dataService.markTaskReviewed(taskId, currentUser.id);
      addToast('Marked as reviewed! Yellow highlight removed.', 'success');
      return result;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [currentUser, addToast]);

  const requestTaskChanges = useCallback((taskId, feedbackNote) => {
    try {
      const result = dataService.requestTaskChanges(taskId, currentUser.id, feedbackNote);
      addToast('Feedback sent. Task returned to the author.', 'info');
      return result;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [currentUser, addToast]);

  const markTaskDone = useCallback((taskId) => {
    try {
      const result = dataService.markTaskDone(taskId);
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }
      addToast('Task marked as completed!', 'success');
      return result;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [editingTaskId, addToast]);

  const createTask = useCallback((taskData) => {
    try {
      const newTask = dataService.createTask({
        ...taskData,
        createdBy: currentUser.id,
      });
      setSelectedTaskId(newTask.id);
      addToast(`Task "${newTask.title}" created`, 'success');
      return newTask;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [currentUser, addToast]);

  const addComment = useCallback((commentData) => {
    try {
      const comment = dataService.addComment({
        ...commentData,
        authorId: currentUser.id,
      });
      return comment;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  }, [currentUser, addToast]);

  const getChangeRecord = useCallback((taskId) => {
    return dataService.getChangeRecordByTaskId(taskId);
  }, []);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;
  const editingTask = tasks.find((t) => t.id === editingTaskId) || null;

  return (
    <DataContext.Provider
      value={{
        document,
        tasks,
        versions,
        changeRecords,
        comments,
        selectedTaskId,
        selectedTask,
        editingTaskId,
        editingTask,
        toasts,
        addToast,
        removeToast,
        selectTask,
        claimTask,
        releaseTask,
        dropTask,
        startEditingTask,
        stopEditingTask,
        saveOfficialChange,
        markTaskReviewed,
        requestTaskChanges,
        markTaskDone,
        createTask,
        addComment,
        getChangeRecord,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
