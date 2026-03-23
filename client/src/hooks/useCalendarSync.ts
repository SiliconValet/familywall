import { useState, useCallback, useEffect } from 'react';
import { useInterval } from './useInterval';
import type { SyncResult } from '../types/calendar';

const SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes per D-07

export function useCalendarSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

  // Page visibility detection - pause polling when hidden
  useEffect(() => {
    const handleVisibility = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const triggerSync = useCallback(async () => {
    if (syncing) return; // debounce
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch('/api/calendar/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      const result: SyncResult = await res.json();
      setLastSynced(result.lastSynced);
    } catch {
      setSyncError('Unable to sync calendar. Check your connection and try again.');
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  // Auto-refresh every 15 minutes when page visible (per D-07, CAL-09)
  useInterval(triggerSync, isPageVisible ? SYNC_INTERVAL : null);

  return { syncing, lastSynced, syncError, triggerSync };
}
