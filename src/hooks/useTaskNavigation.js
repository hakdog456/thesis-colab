import { useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { resolveTaskTarget, scrollEditorToPos } from '../utils/documentPositions';

export function useTaskNavigation(editor) {
  const { selectTask, addToast } = useData();

  const navigateToTask = useCallback(
    (task) => {
      if (!task) return;

      selectTask(task.id);

      if (!editor) return;

      const resolution = resolveTaskTarget(editor.state.doc, task.target);

      if (resolution.status === 'needs_attention') {
        addToast(
          `Target warning: ${resolution.reason || 'Anchor text could not be located'}`,
          'error'
        );
        // If blockPos exists, we can still scroll to the block
        if (resolution.blockPos !== undefined) {
          scrollEditorToPos(editor, resolution.blockPos);
        }
        return;
      }

      if (resolution.from !== undefined) {
        scrollEditorToPos(editor, resolution.from);
      }
    },
    [editor, selectTask, addToast]
  );

  return { navigateToTask };
}
