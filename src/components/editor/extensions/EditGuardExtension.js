import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { findBlockByIdInDoc, resolveTaskTarget } from '../../../utils/documentPositions.js';

export const editGuardPluginKey = new PluginKey('editGuard');

export const EditGuardExtension = Extension.create({
  name: 'editGuard',

  addOptions() {
    return {
      getGuardState: null,
      onBlockedEdit: null,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: editGuardPluginKey,
        filterTransaction(tr, state) {
          // Allow all transactions that do not modify doc text/structure (e.g. selection, cursor)
          if (!tr.docChanged) {
            return true;
          }

          // Get latest guard state synchronously
          const guard = extension.options.getGuardState ? extension.options.getGuardState() : {};
          const {
            isEditingMode = false,
            editingTargetBlockId = null,
            editingTask = null,
            currentUserId = null,
            taskOwnerId = null,
            isWholeDocumentTask = false,
            tasks = [],
            startEditingTask = null,
            getUser = null,
            isProgrammatic = null,
          } = guard;

          // Allow programmatic content updates (e.g. setContent, replaceDocument)
          if (
            (typeof tr.getMeta === 'function' && (tr.getMeta('bypass-guard') || tr.getMeta('addToHistory') === false)) ||
            (typeof isProgrammatic === 'function' && isProgrammatic())
          ) {
            return true;
          }

          const notifyBlocked = (reason) => {
            if (extension.options.onBlockedEdit) {
              extension.options.onBlockedEdit({ reason });
            }
          };

          // Find where the transaction is changing the document
          let changeStart = tr.selection.from;
          let changeEnd = tr.selection.to;
          if (tr.steps && tr.steps.length > 0) {
            tr.steps.forEach((step) => {
              step.getMap().forEach((oldStart, oldEnd) => {
                changeStart = Math.min(changeStart, oldStart);
                changeEnd = Math.max(changeEnd, oldEnd);
              });
            });
          }

          // ── EDITING MODE: whole-document task ──────────────────────────────
          if (isEditingMode && isWholeDocumentTask) {
            if (currentUserId && taskOwnerId && currentUserId !== taskOwnerId) {
              const ownerObj = getUser ? getUser(taskOwnerId) : null;
              const ownerName = ownerObj?.name || taskOwnerId;
              notifyBlocked(`Only the assigned task owner (${ownerName}) is allowed to edit this document.`);
              return false;
            }
            return true;
          }

          // ── EDITING MODE: target-scoped task ───────────────────────────────
          // Edits are strictly gated to the highlighted section of the task.
          if (isEditingMode && editingTargetBlockId) {
            const block = findBlockByIdInDoc(state.doc, editingTargetBlockId);
            if (block) {
              let allowedFrom = block.pos;
              let allowedTo = block.pos + block.node.nodeSize;

              // If task target specifies a highlighted range, restrict edits strictly to that highlight
              if (editingTask && editingTask.target) {
                const resolution = resolveTaskTarget(state.doc, editingTask.target);
                if (resolution && resolution.status === 'valid') {
                  allowedFrom = resolution.from;
                  allowedTo = resolution.to;
                }
              }

              const isWithin = changeStart >= allowedFrom && changeEnd <= allowedTo;

              if (!isWithin) {
                // Typed outside the assigned highlight section — hard block
                notifyBlocked('You can only edit the highlighted section assigned to this task.');
                return false;
              }

              // Within highlight: verify ownership
              if (currentUserId && taskOwnerId && currentUserId !== taskOwnerId) {
                const ownerObj = getUser ? getUser(taskOwnerId) : null;
                const ownerName = ownerObj?.name || taskOwnerId;
                notifyBlocked(`Only the assigned task owner (${ownerName}) is allowed to edit this section.`);
                return false;
              }
              return true;
            }

            // Target block was deleted — block all edits
            notifyBlocked('The target block for this task no longer exists.');
            return false;
          }

          // ── NOT IN EDITING MODE: check which block is being targeted ──────
          let targetedBlockId = null;
          state.doc.descendants((node, pos) => {
            if (node.attrs && node.attrs.blockId) {
              if (pos <= changeStart && changeEnd <= pos + node.nodeSize) {
                targetedBlockId = node.attrs.blockId;
                return false;
              }
            }
            return true;
          });

          if (targetedBlockId) {
            const taskForBlock = tasks.find((t) => t.target?.blockId === targetedBlockId);

            if (taskForBlock) {
              if (taskForBlock.ownerId === currentUserId) {
                // Auto-activate edit mode for the user's own claimed task
                if (startEditingTask) {
                  startEditingTask(taskForBlock.id);
                }
                notifyBlocked('Editing enabled for your claimed task. Please type again.');
                return false;
              } else if (!taskForBlock.ownerId) {
                notifyBlocked('This section is unclaimed. Click "Claim Task" in the side panel to edit it.');
                return false;
              } else {
                const ownerObj = getUser ? getUser(taskForBlock.ownerId) : null;
                const ownerName = ownerObj?.name || taskForBlock.ownerId;
                notifyBlocked(`This section is assigned to ${ownerName}. Only they can edit it.`);
                return false;
              }
            }
          }

          // Block has no task or is not editable
          notifyBlocked('Select or claim a task from the list on the left to edit this section.');
          return false;
        },
      }),
    ];
  },
});
