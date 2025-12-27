import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for handling auto-save functionality
 * Automatically saves data after a specified delay of inactivity
 *
 * @param {*} data - The data to auto-save
 * @param {Function} onSave - Callback function to execute when saving
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Delay in milliseconds before auto-saving (default: 1000)
 * @param {boolean} options.enabled - Whether auto-save is enabled (default: true)
 * @param {Function} options.onError - Callback for handling save errors
 * @param {Function} options.onSuccess - Callback for successful saves
 * @returns {Object} Object containing save state and methods
 */
export const useAutoSave = (
  data,
  onSave,
  {
    delay = 1000,
    enabled = true,
    onError = null,
    onSuccess = null,
  } = {}
) => {
  const timeoutRef = useRef(null);
  const isSavingRef = useRef(false);
  const lastSavedDataRef = useRef(data);
  const dataChangedRef = useRef(false);

  // Clear existing timeout
  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      global.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Execute save operation
  const executeSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) {
      return;
    }

    // Check if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedDataRef.current)) {
      dataChangedRef.current = false;
      return;
    }

    isSavingRef.current = true;

    try {
      await onSave(data);
      lastSavedDataRef.current = data;
      dataChangedRef.current = false;

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
      console.error('Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, enabled, onSave, onError, onSuccess]);

  // Set up auto-save timer
  useEffect(() => {
    if (!enabled) {
      clearTimeout();
      return;
    }

    // Clear previous timeout
    clearTimeout();

    // Check if data has changed
    if (JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current)) {
      dataChangedRef.current = true;
    }

    // Set new timeout
    if (dataChangedRef.current) {
      timeoutRef.current = global.setTimeout(() => {
        executeSave();
      }, delay);
    }

    // Cleanup on unmount
    return () => {
      clearTimeout();
    };
  }, [data, delay, enabled, executeSave, clearTimeout]);

  // Manual save trigger
  const save = useCallback(() => {
    clearTimeout();
    return executeSave();
  }, [executeSave, clearTimeout]);

  // Reset to last saved state
  const reset = useCallback(() => {
    clearTimeout();
    dataChangedRef.current = false;
  }, [clearTimeout]);

  return {
    save,
    reset,
    isSaving: isSavingRef.current,
    hasChanged: dataChangedRef.current,
  };
};

export default useAutoSave;
