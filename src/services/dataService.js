import { v4 as uuidv4 } from 'uuid';
import {
  sampleDocument,
  sampleTasks,
  sampleVersions,
  sampleComments,
  users,
} from '../data/sampleData.js';
import { TASK_STATUS } from '../utils/constants.js';

// In-memory state
let currentDocument = JSON.parse(JSON.stringify(sampleDocument));
let tasks = JSON.parse(JSON.stringify(sampleTasks));
let versions = JSON.parse(JSON.stringify(sampleVersions));
let comments = JSON.parse(JSON.stringify(sampleComments));
let changeRecords = []; // Array of change records

// Helper: deep clone
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// Helper: find block in Tiptap JSON document by blockId
export function findBlockNode(docContent, blockId) {
  if (!docContent || !docContent.content) return null;
  for (const node of docContent.content) {
    if (node.attrs && node.attrs.blockId === blockId) {
      return node;
    }
  }
  return null;
}

// Helper: get plain text of a block
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

// Helper: replace block text content in Tiptap JSON document
export function updateBlockContent(docContent, blockId, newText) {
  if (!docContent || !docContent.content) return false;
  const index = docContent.content.findIndex(
    (node) => node.attrs && node.attrs.blockId === blockId
  );
  if (index === -1) return false;

  if (newText === null || newText === undefined || newText === '') {
    // If empty text or deletion
    docContent.content[index].content = [];
  } else {
    docContent.content[index].content = [{ type: 'text', text: newText }];
  }
  return true;
}

// Helper: delete block completely from document
export function deleteBlockNode(docContent, blockId) {
  if (!docContent || !docContent.content) return false;
  const index = docContent.content.findIndex(
    (node) => node.attrs && node.attrs.blockId === blockId
  );
  if (index === -1) return false;
  docContent.content.splice(index, 1);
  return true;
}

export const dataService = {
  // ── Documents ─────────────────────────────────────────
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

  // ── Tasks ─────────────────────────────────────────────
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
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

    comments.push({
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
    });

    return clone(task);
  },

  updateTaskStatus(taskId, status) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    task.status = status;
    task.updatedAt = new Date().toISOString();
    return clone(task);
  },

  // ── Official Document Direct Edit & Autosave (Sections 1, 4 & 9) ──
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

    // Check if we already have an unreviewed change record for this task
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
      // Update existing record
      record.newContent = normalizedText;
      record.isDeleted = isDeletion;
      record.changedAt = new Date().toISOString();
      record.changedBy = userId || task.ownerId;
    } else {
      // Create new change record
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

    // 1. Immediately update official document content
    if (isWholeDocument) {
      currentDocument.content = normalizedContent;
    } else if (isDeletion) {
      updateBlockContent(currentDocument.content, targetBlockId, '');
    } else {
      updateBlockContent(currentDocument.content, targetBlockId, normalizedContent);
    }
    currentDocument.updatedAt = new Date().toISOString();

    // 2. Mark task status as CHANGED
    task.status = TASK_STATUS.CHANGED;
    task.updatedAt = new Date().toISOString();



    // 3. Mint Version N -> Version N+1
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

    return {
      document: clone(currentDocument),
      task: clone(task),
      changeRecord: clone(record),
      version: clone(newVersion),
    };
  },

  // ── Teammate Review (Sections 5 & 10) ──────────────────
  markTaskReviewed(taskId, reviewerId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    // Find active change record and mark as reviewed
    const record = changeRecords.find((r) => r.taskId === taskId && !r.isReviewed);
    if (record) {
      record.isReviewed = true;
      record.reviewedBy = reviewerId;
      record.reviewedAt = new Date().toISOString();
    }

    // Update task status to REVIEWED
    task.status = TASK_STATUS.REVIEWED;
    task.updatedAt = new Date().toISOString();

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

    comments.push({
      id: `comment-${uuidv4().slice(0, 8)}`,
      documentId: task.documentId,
      taskId,
      changeRecordId: record.id,
      authorId: reviewerId,
      content: `Changes requested: ${note}`,
      status: 'open',
      parentCommentId: null,
      createdAt: event.createdAt,
    });

    task.status = TASK_STATUS.CHANGES_REQUESTED;
    task.updatedAt = new Date().toISOString();

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
    return clone(task);
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

  // ── Versions (Section 15) ─────────────────────────────
  getVersionHistory(documentId = 'doc-1') {
    return clone(versions);
  },

  getVersion(versionId) {
    const ver = versions.find((v) => v.id === versionId);
    return ver ? clone(ver) : null;
  },

  // ── Comments ──────────────────────────────────────────
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
    return clone(newComment);
  },

  // ── Reset ─────────────────────────────────────────────
  resetData() {
    currentDocument = JSON.parse(JSON.stringify(sampleDocument));
    tasks = JSON.parse(JSON.stringify(sampleTasks));
    versions = JSON.parse(JSON.stringify(sampleVersions));
    comments = JSON.parse(JSON.stringify(sampleComments));
    changeRecords = [];
  },
};
