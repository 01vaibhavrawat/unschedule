import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoSave<T>(
  value: T,
  saveFn: (val: T) => Promise<void> | void,
  delay: number = 1000
) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const valueRef = useRef(value);
  valueRef.current = value;
  
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;
  
  // Track the last successfully saved value to avoid redundant saves.
  const lastSavedValueRef = useRef(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async (valToSave: T) => {
    if (JSON.stringify(valToSave) === JSON.stringify(lastSavedValueRef.current)) return;
    
    setIsSaving(true);
    setError(null);
    try {
      await saveFnRef.current(valToSave);
      lastSavedValueRef.current = valToSave;
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (JSON.stringify(value) === JSON.stringify(lastSavedValueRef.current)) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, save]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (JSON.stringify(valueRef.current) !== JSON.stringify(lastSavedValueRef.current)) {
        // Fire and forget, don't wait for completion on unmount
        saveFnRef.current(valueRef.current);
      }
    };
  }, []);

  return { isSaving, error, forceSave: () => save(valueRef.current) };
}
