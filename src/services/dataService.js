import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import {
  sampleDocument,
  sampleTasks,
  sampleVersions,
  sampleComments,
  users,
} from '../data/sampleData.js';
import { TASK_STATUS } from '../utils/constants.js';

// In-memory state as fallback & local cache
let currentDocument = JSON.parse(JSON.stringify(sampleDocument));
let tasks = JSON.parse(JSON.stringify(sampleTasks));
let versions = JSON.parse(JSON.stringify(sampleVersions));
let comments = JSON.parse(JSON.stringify(sampleComments));
let changeRecords = [];

const clone = (obj) => JSON.parse(JSON.stringify(obj));

export function findBlockNode(docContent, blockId) {
  if (!docContent || !docContent.content) return null;
  for (const node of docContent.content) {
    if (node.attrs && node.attrs.blockId === blockId) {
      return node;
    }
  }
  return null;
}

export function getBlockText(blockNode) {
  if (!blockNode || !blockNode.content) return '';
  return blockNode.content.map((c) => c.text || '').join('');
}

function getDocumentText(docContent) {
  if (!docContent?.content) return '';
  return docContent.content
    .map((node) => getBlockText(node))
    .filter(Boolean)
    .join('\n');
}

export function updateBlockContent(docContent, blockId, newText) {
  if (!docContent || !docContent.content) return false;
  const index = docContent.content.findIndex(
    (node) => node.attrs && node.attrs.blockId === blockId
  );
  if (index === -1) return false;

  if (newText === null || newText === undefined || newText === '') {
    docContent.content[index].content = [];
  } else {
    docContent.content[index].content = [{ type: 'text', text: newText }];
  }
  return true;
}

export function deleteBlockNode(docContent, blockId) {
  if (!docContent || !docContent.content) return false;
  const index = docContent.content.findIndex(
    (node) => node.attrs && node.attrs.blockId === blockId
  );
  if (index === -1) return false;
  docContent.content.splice(index, 1);
  return true;
}

// Sync helper to write document to Firestore
async function syncDocumentToFirestore(docData) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'documents', docData.id || 'doc-1'), docData);
  } catch (e) {
    console.warn('Firestore doc write error:', e);
  }
}

async function syncTaskToFirestore(taskData) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'tasks', taskData.id), taskData);
  } catch (e) {
    console.warn('Firestore task write error:', e);
  }
}

async function deleteTaskFromFirestore(taskId) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (e) {
    console.warn('Firestore task delete error:', e);
  }
}

async function syncVersionToFirestore(versionData) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'versions', versionData.id), versionData);
  } catch (e) {
    console.warn('Firestore version write error:', e);
  }
}

async function syncCommentToFirestore(commentData) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'comments', commentData.id), commentData);
  } catch (e) {
    console.warn('Firestore comment write error:', e);
  }
}

async function syncChangeRecordToFirestore(recordData) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'changeRecords', recordData.id), recordData);
  } catch (e) {
    console.warn('Firestore changeRecord write error:', e);
  }
}

export const dataService = {
  // Real-time Firestore Subscribers
  subscribeToDocument(callback) {
    if (!db) {
      callback(currentDocument);
      return () => {};
    }
    const docRef = doc(db, 'documents', 'doc-1');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        currentDocument = docSnap.data();
        callback(currentDocument);
      } else {
        // Initialize doc-1 in Firestore if empty
        syncDocumentToFirestore(currentDocument);
        callback(currentDocument);
      }
    });
  },

  subscribeToTasks(callback) {
    if (!db) {
      callback(tasks);
      return () => {};
    }
    const colRef = collection(db, 'tasks');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        tasks = snapshot.docs.map(doc => doc.data());
        callback(tasks);
      } else {
        // Seed default sample tasks
        sampleTasks.forEach(t => syncTaskToFirestore(t));
        callback(tasks);
      }
    });
  },

  subscribeToVersions(callback) {
    if (!db) {
      callback(versions);
      return () => {};
    }
    const colRef = collection(db, 'versions');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        versions = snapshot.docs.map(doc => doc.data()).sort((a, b) => b.versionNumber - a.versionNumber);
        callback(versions);
      } else {
        sampleVersions.forEach(v => syncVersionToFirestore(v));
        callback(versions);
      }
    });
  },

  subscribeToComments(callback) {
    if (!db) {
      callback(comments);
      return () => {};
    }
    const colRef = collection(db, 'comments');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        comments = snapshot.docs.map(doc => doc.data());
        callback(comments);
      } else {
        sampleComments.forEach(c => syncCommentToFirestore(c));
        callback(comments);
      }
    });
  },

  subscribeToChangeRecords(callback) {
    if (!db) {
      callback(changeRecords);
      return () => {};
    }
    const colRef = collection(db, 'changeRecords');
    return onSnapshot(colRef, (snapshot) => {
      changeRecords = snapshot.docs.map(doc => doc.data());
      callback(changeRecords);
    });
  },

  getDocument(documentId = 'doc-1') {
    return clone(currentDocument);
  },

  getDocumentContent(documentId = 'doc-1') {
    return clone(currentDocument.content);
  },

  getDocumentVersion(documentId, versionId) {
    const version = versions.find((v) => v.id === versionId);
    return version ? clone(version) : null;
  },

  getTasks(documentId = 'doc-1') {
    return clone(tasks);
  },

  getTask(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    return task ? clone(task) : null;
  },

  createTask(taskData) {
    const newTask = {
      id: `task-${uuidv4().slice(0, 8)}`,
      documentId: taskData.documentId || currentDocument.id,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: taskData.ownerId ? TASK_STATUS.IN_PROGRESS : TASK_STATUS.AVAILABLE,
      ownerId: taskData.ownerId || null,
      createdBy: taskData.createdBy,
      target: {
        chapterId: taskData.target?.chapterId || '',
        sectionId: taskData.target?.sectionId || '',
        blockId: taskData.target?.blockId || '',
        anchorText: taskData.target?.anchorText || '',
        startOffset: taskData.target?.startOffset || 0,
        endOffset: taskData.target?.endOffset || 0,
        targetStatus: 'valid',
      },
      dueDate: taskData.dueDate || null,
      deleteVotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    syncTaskToFirestore(newTask);
    return clone(newTask);
  },

  claimTask(taskId, userId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    if (task.ownerId && task.ownerId !== userId && task.status === TASK_STATUS.IN_PROGRESS) {
      throw new Error('This task is already claimed by another user');
    }

    task.ownerId = userId;
    task.status = TASK_STATUS.IN_PROGRESS;
    task.updatedAt = new Date().toISOString();
    syncTaskToFirestore(task);
    return clone(task);
  },

  releaseTask(taskId, userId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    if (task.ownerId !== userId) {
      throw new Error('Only the assigned owner can release this task');
    }

    task.ownerId = null;
    task.status = TASK_STATUS.AVAILABLE;
    task.updatedAt = new Date().toISOString();
    syncTaskToFirestore(task);
    return clone(task);
  },

  dropTask(taskId, userId, reason = '') {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    if (task.ownerId !== userId) {
      throw new Error('Only the assigned owner can drop this task');
    }

    const trimmedReason = reason.trim();
    const droppedAt = new Date().toISOString();

    task.ownerId = null;
    task.status = TASK_STATUS.AVAILABLE;
    task.updatedAt = droppedAt;
    syncTaskToFirestore(task);

    const newComment = {
      id: `comment-${uuidv4().slice(0, 8)}`,
      documentId: task.documentId,
      taskId,
      changeRecordId: null,
      changeRequestId: null,
      authorId: userId,
      content: trimmedReason
        ? `Dropped this task. Reason: ${trimmedReason}`
        : 'Dropped this task.',
      status: 'open',
      parentCommentId: null,
      createdAt: droppedAt,
    };
    comments.push(newComment);
    syncCommentToFirestore(newComment);

    return clone(task);
  },

  updateTaskStatus(taskId, status) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    task.status = status;
    task.updatedAt = new Date().toISOString();
    syncTaskToFirestore(task);
    return clone(task);
  },

  saveOfficialDocumentChange(taskId, newContent, userId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const isWholeDocument = Boolean(task.target?.wholeDocument);
    const targetBlockId = task.target.blockId;
    const block = isWholeDocument ? null : findBlockNode(currentDocument.content, targetBlockId);
    if (isWholeDocument && (!newContent || typeof newContent !== 'object')) {
      throw new Error('Whole-document edits must save document content');
    }
    if (!isWholeDocument && !block) throw new Error('Task target block was not found');

    const normalizedContent = isWholeDocument ? clone(newContent) : newContent || '';
    const normalizedText = isWholeDocument ? getDocumentText(normalizedContent) : normalizedContent;
    const existingOriginalText = isWholeDocument ? getDocumentText(currentDocument.content) : getBlockText(block);

    const isDeletion = !isWholeDocument && normalizedContent === '';

    let record = changeRecords.find((r) => r.taskId === taskId && !r.isReviewed);

    if (!record && existingOriginalText === normalizedText) {
      return {
        document: clone(currentDocument),
        task: clone(task),
        changeRecord: null,
        version: null,
      };
    }

    if (record && record.newContent === normalizedText && record.isDeleted === isDeletion) {
      return {
        document: clone(currentDocument),
        task: clone(task),
        changeRecord: clone(record),
        version: null,
      };
    }

    if (record) {
      record.newContent = normalizedText;
      record.isDeleted = isDeletion;
      record.changedAt = new Date().toISOString();
      record.changedBy = userId || task.ownerId;
    } else {
      record = {
        id: `change-${uuidv4().slice(0, 8)}`,
        taskId,
        documentId: task.documentId,
        blockId: targetBlockId,
        taskTitle: task.title,
        targetSection: `${task.target.chapterId} · ${task.target.sectionId}`,
        previousContent: existingOriginalText,
        newContent: normalizedText,
        isDeleted: isDeletion,
        changedBy: userId || task.ownerId,
        changedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null,
        isReviewed: false,
        reviewEvents: [],
      };
      changeRecords.unshift(record);
    }
    syncChangeRecordToFirestore(record);

    if (isWholeDocument) {
      currentDocument.content = normalizedContent;
    } else if (isDeletion) {
      updateBlockContent(currentDocument.content, targetBlockId, '');
    } else {
      updateBlockContent(currentDocument.content, targetBlockId, normalizedContent);
    }
    currentDocument.updatedAt = new Date().toISOString();
    syncDocumentToFirestore(currentDocument);

    task.status = TASK_STATUS.CHANGED;
    if (task.target && !isWholeDocument && !isDeletion) {
      task.target.anchorText = normalizedText;
      task.target.startOffset = 0;
      task.target.endOffset = normalizedText.length;
    }
    task.updatedAt = new Date().toISOString();
    syncTaskToFirestore(task);

    const newVersionNumber = versions.length + 1;
    const newVersionId = `ver-${newVersionNumber}`;
    currentDocument.currentVersionId = newVersionId;

    const newVersion = {
      id: newVersionId,
      documentId: currentDocument.id,
      versionNumber: newVersionNumber,
      content: clone(currentDocument.content),
      createdBy: userId || task.ownerId,
      reviewedBy: null,
      changeSummary: isDeletion ? `Deleted paragraph in ${task.target.sectionId}` : `Updated ${task.title}`,
      previousContent: record.previousContent,
      newContent: record.newContent,
      createdAt: new Date().toISOString(),
    };
    versions.unshift(newVersion);
    syncVersionToFirestore(newVersion);

    return {
      document: clone(currentDocument),
      task: clone(task),
      changeRecord: clone(record),
      version: clone(newVersion),
    };
  },

  markTaskReviewed(taskId, reviewerId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const record = changeRecords.find((r) => r.taskId === taskId && !r.isReviewed);
    if (record) {
      record.isReviewed = true;
      record.reviewedBy = reviewerId;
      record.reviewedAt = new Date().toISOString();
      syncChangeRecordToFirestore(record);
    }

    task.status = TASK_STATUS.REVIEWED;
    task.updatedAt = new Date().toISOString();
    syncTaskToFirestore(task);

    return {
      task: clone(task),
      changeRecord: record ? clone(record) : null,
    };
  },

  requestTaskChanges(taskId, reviewerId, feedbackNote) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const record = changeRecords.find((r) => r.taskId === taskId && !r.isReviewed);
    if (!record) throw new Error('No active change record found for this task');

    const note = feedbackNote?.trim();
    if (!note) throw new Error('Feedback note is required');

    const event = {
      id: `review-${uuidv4().slice(0, 8)}`,
      type: 'changes_requested',
      reviewerId,
      note,
      createdAt: new Date().toISOString(),
    };

    record.reviewEvents = [...(record.reviewEvents || []), event];
    record.lastFeedbackNote = note;
    record.lastFeedbackBy = reviewerId;
    record.lastFeedbackAt = event.createdAt;
    syncChangeRecordToFirestore(record);

    const newComment = {
      id: `comment-${uuidv4().slice(0, 8)}`,
      documentId: task.documentId,
      taskId,
      changeRecordId: record.id,
      authorId: reviewerId,
      content: `Changes requested: ${note}`,
      status: 'open',
      parentCommentId: null,
      createdAt: event.createdAt,
    };
    comments.push(newComment);
    syncCommentToFirestore(newComment);

    task.status = TASK_STATUS.CHANGES_REQUESTED;
    task.updatedAt = new Date().toISOString();
    syncTaskToFirestore(task);

    return {
      task: clone(task),
      changeRecord: clone(record),
      reviewEvent: clone(event),
    };
  },

  markTaskDone(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.status = TASK_STATUS.DONE;
    task.updatedAt = new Date().toISOString();
    syncTaskToFirestore(task);
    return clone(task);
  },

  voteToDeleteTask(taskId, userId) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');

    const task = tasks[taskIndex];
    if (!Array.isArray(task.deleteVotes)) {
      task.deleteVotes = [];
    }

    const hasVoted = task.deleteVotes.includes(userId);
    if (hasVoted) {
      task.deleteVotes = task.deleteVotes.filter((id) => id !== userId);
    } else {
      task.deleteVotes.push(userId);
    }

    task.updatedAt = new Date().toISOString();

    const totalRequiredVotes = users.length || 3;
    if (task.deleteVotes.length >= totalRequiredVotes) {
      // Unanimous agreement reached (3/3 votes) -> Delete task
      const deletedTask = clone(task);
      tasks.splice(taskIndex, 1);
      deleteTaskFromFirestore(taskId);
      return { deleted: true, task: deletedTask };
    } else {
      syncTaskToFirestore(task);
      return { deleted: false, task: clone(task) };
    }
  },

  getChangeRecords(documentId = 'doc-1') {
    return clone(changeRecords);
  },

  getChangeRecordByTaskId(taskId) {
    const record = changeRecords.find((r) => r.taskId === taskId && !r.isReviewed);
    if (record) return clone(record);

    const historicalRecord = changeRecords.find((r) => r.taskId === taskId);
    return historicalRecord ? clone(historicalRecord) : null;
  },

  getVersionHistory(documentId = 'doc-1') {
    return clone(versions);
  },

  getVersion(versionId) {
    const ver = versions.find((v) => v.id === versionId);
    return ver ? clone(ver) : null;
  },

  getComments(filters = {}) {
    let result = clone(comments);
    if (filters.taskId) {
      result = result.filter((c) => c.taskId === filters.taskId);
    }
    return result;
  },

  addComment(commentData) {
    const newComment = {
      id: `comment-${uuidv4().slice(0, 8)}`,
      documentId: commentData.documentId || currentDocument.id,
      taskId: commentData.taskId || null,
      changeRecordId: commentData.changeRecordId || null,
      changeRequestId: commentData.changeRequestId || null,
      authorId: commentData.authorId,
      content: commentData.content,
      status: 'open',
      parentCommentId: commentData.parentCommentId || null,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    syncCommentToFirestore(newComment);
    return clone(newComment);
  },

  resetData() {
    currentDocument = JSON.parse(JSON.stringify(sampleDocument));
    tasks = JSON.parse(JSON.stringify(sampleTasks));
    versions = JSON.parse(JSON.stringify(sampleVersions));
    comments = JSON.parse(JSON.stringify(sampleComments));
    changeRecords = [];
    syncDocumentToFirestore(currentDocument);
    sampleTasks.forEach(t => syncTaskToFirestore(t));
    sampleVersions.forEach(v => syncVersionToFirestore(v));
    sampleComments.forEach(c => syncCommentToFirestore(c));
  },
};
