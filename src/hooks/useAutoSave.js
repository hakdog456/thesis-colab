import { useState, useRef, useCallback, useEffect } from 'react';

export function useAutoSave(onSave, delay = 1200) {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'idle' | 'saving' | 'saved' | 'error'
  const timerRef = useRef(null);
  const pendingDataRef = useRef(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const flushChange = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (pendingDataRef.current === null) {
      return;
    }

    try {
      setSaveStatus('saving');
      await onSaveRef.current?.(pendingDataRef.current);
      pendingDataRef.current = null;
      setSaveStatus('saved');
    } catch (err) {
      console.error('Autosave failed:', err);
      setSaveStatus('error');
      throw err;
    }
  }, []);

  const triggerChange = useCallback(
    (data) => {
      pendingDataRef.current = data;
      setSaveStatus('saving');

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        try {
          if (onSaveRef.current && pendingDataRef.current !== null) {
            await onSaveRef.current(pendingDataRef.current);
            pendingDataRef.current = null;
            setSaveStatus('saved');
          }
        } catch (err) {
          console.error('Autosave failed:', err);
          setSaveStatus('error');
        }
      }, delay);
    },
    [delay]
  );

  // Flush any unsaved changes on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (pendingDataRef.current !== null && onSaveRef.current) {
        try {
          onSaveRef.current(pendingDataRef.current);
          pendingDataRef.current = null;
        } catch (err) {
          console.error('Error flushing autosave on unmount:', err);
        }
      }
    };
  }, []);

  return { saveStatus, triggerChange, flushChange, setSaveStatus };
}
