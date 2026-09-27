import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { resolveTaskTarget } from '../../../utils/documentPositions';
import { USER_COLORS, TASK_STATUS, getTaskColorMeta } from '../../../utils/constants';

export const taskHighlightPluginKey = new PluginKey('taskHighlight');

export const TaskHighlightExtension = Extension.create({
  name: 'taskHighlight',

  addOptions() {
    return {
      tasks: [],
      selectedTaskId: null,
      getUser: null,
      onTaskClick: null,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    let currentOptions = extension.options;

    return [
      new Plugin({
        key: taskHighlightPluginKey,
        state: {
          init(_, { doc }) {
            return computeDecorations(doc, extension.options);
          },
          apply(tr, oldSet, oldState, newState) {
            const meta = tr.getMeta(taskHighlightPluginKey);
            if (meta) {
              const options = meta?.options || extension.options;
              currentOptions = options;
              return computeDecorations(newState.doc, options);
            }
            if (tr.docChanged) {
              return oldSet.map(tr.mapping, newState.doc);
            }
            return oldSet;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, pos, event) {
            if (currentOptions.isEditingMode) {
              return false;
            }
            const target = event.target.closest('[data-task-id]');
            if (target) {
              const taskId = target.getAttribute('data-task-id');
              if (taskId) {
                // Trigger flash animation strictly on click
                target.classList.remove('task-highlight--flash');
                void target.offsetWidth; // force reflow
                target.classList.add('task-highlight--flash');
                setTimeout(() => {
                  target.classList.remove('task-highlight--flash');
                }, 1800);

                if (currentOptions.onTaskClick) {
                  currentOptions.onTaskClick(taskId);
                }
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

function computeDecorations(doc, options) {
  const { tasks = [], selectedTaskId = null, getUser = null } = options;
  const decorations = [];

  for (const task of tasks) {
    if (task.status === TASK_STATUS.DONE || task.status === TASK_STATUS.REVIEWED) {
      continue;
    }

    if (!task.target || !task.target.blockId) continue;

    const resolution = resolveTaskTarget(doc, task.target);
    if (resolution.status === 'needs_attention' || resolution.from === undefined) {
      continue;
    }

    const isSelected = task.id === selectedTaskId;
    const isChanged = task.status === TASK_STATUS.CHANGED;
    const isChangesRequested = task.status === TASK_STATUS.CHANGES_REQUESTED;
    const author = task.ownerId && getUser ? getUser(task.ownerId) : null;
    const authorName = author ? author.name : 'Teammate';
    const taskColor = getTaskColorMeta(task, tasks);

    let className = 'task-highlight ';
    let labelText = '';

    if (isChangesRequested) {
      className += `task-highlight--${taskColor.id} task-highlight--changes-requested `;
      labelText = `Changes requested for ${authorName}`;
    } else if (isChanged) {
      className += `task-highlight--${taskColor.id} task-highlight--changed `;
      labelText = `Changed by ${authorName}`;
    } else {
      className += `task-highlight--${taskColor.id} `;
      labelText = `Task: ${task.title}`;
    }

    if (isSelected) {
      className += 'task-highlight--emphasized ';
    }

    decorations.push(
      Decoration.inline(resolution.from, resolution.to, {
        class: className.trim(),
        'data-task-id': task.id,
        'data-tooltip': labelText,
      })
    );
  }

  return DecorationSet.create(doc, decorations);
}

