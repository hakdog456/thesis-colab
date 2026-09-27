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
          if (isEditingMode && editingTargetBlockId) {
            const allowedBlockIds = [
              editingTargetBlockId,
              ...(editingTask?.target?.additionalBlockIds || []),
            ];

            let isWithin = false;
            for (const bId of allowedBlockIds) {
              const block = findBlockByIdInDoc(state.doc, bId);
              if (block) {
                const allowedFrom = block.pos;
                const allowedTo = block.pos + block.node.nodeSize;
                if (changeStart >= allowedFrom && changeStart <= allowedTo) {
                  isWithin = true;
                  break;
                }
              }
            }

            if (!isWithin) {
              notifyBlocked('You can only edit the block assigned to this task.');
              return false;
            }

            // Verify ownership
            if (currentUserId && taskOwnerId && currentUserId !== taskOwnerId) {
              const ownerObj = getUser ? getUser(taskOwnerId) : null;
              const ownerName = ownerObj?.name || taskOwnerId;
              notifyBlocked(`Only the assigned task owner (${ownerName}) is allowed to edit this section.`);
              return false;
            }
            return true;
          }

          // ── NOT IN EDITING MODE ───────────────────────────────────────────
          notifyBlocked('Click the "Edit Task" button in the right panel to edit this section.');
          return false;
        },
      }),
    ];
  },
});
