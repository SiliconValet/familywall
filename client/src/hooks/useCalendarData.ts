import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type { CalendarEvent, CalendarAuthStatus, MergedTimelineItem } from '../types/calendar';
import type { Chore } from '../types/chore';
import { startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, format } from 'date-fns';

export function useCalendarData(viewDate: Date, viewMode: 'daily' | 'weekly' | 'monthly') {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<CalendarAuthStatus>({ connected: false, email: null });

  // Compute date range based on view mode.
  // The server SQL uses exclusive end (start_time < end), so `end` must be
  // the day *after* the last day we want included.
  const dateRange = useMemo(() => {
    let start: Date, end: Date;
    if (viewMode === 'daily') {
      start = startOfDay(viewDate);
      end = addDays(startOfDay(viewDate), 1);
    } else if (viewMode === 'weekly') {
      start = startOfWeek(viewDate, { weekStartsOn: 1 }); // Monday per D-13
      end = addDays(endOfWeek(viewDate, { weekStartsOn: 1 }), 1);
    } else {
      start = startOfMonth(viewDate);
      end = addDays(endOfMonth(viewDate), 1);
    }
    return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
  }, [viewDate, viewMode]);

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/status');
      if (res.ok) {
        const data: CalendarAuthStatus = await res.json();
        setAuthStatus(data);
        return data.connected;
      }
    } catch { /* silent */ }
    return false;
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/calendar/events?start=${dateRange.start}&end=${dateRange.end}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data: CalendarEvent[] = await res.json();
      setEvents(data);
    } catch {
      toast.error('Calendar unavailable \u2014 no internet connection');
      setError('Unable to load calendar events.');
    }
  }, [dateRange]);

  const fetchChores = useCallback(async () => {
    try {
      const res = await fetch(`/api/chores?start=${dateRange.start}&end=${dateRange.end}`);
      if (!res.ok) throw new Error('Failed to fetch chores');
      const data: Chore[] = await res.json();
      setChores(data);
    } catch {
      // Chores fetch failure is non-critical for calendar view
    }
  }, [dateRange]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const connected = await fetchAuthStatus();
    if (connected) {
      await Promise.all([fetchEvents(), fetchChores()]);
    }
    setLoading(false);
  }, [fetchAuthStatus, fetchEvents, fetchChores]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Merge events and chores into unified timeline per D-31, D-33
  const mergedItems: MergedTimelineItem[] = useMemo(() => {
    const items: MergedTimelineItem[] = [
      ...events.map(e => ({
        type: 'event' as const,
        sortTime: e.isAllDay
          ? new Date(e.startDate!).getTime()
          : new Date(e.startTime!).getTime(),
        isAllDay: e.isAllDay,
        data: e,
      })),
      ...chores.map(c => ({
        type: 'chore' as const,
        sortTime: c.created_at * 1000,
        isAllDay: false,
        data: c,
      })),
    ];
    return items.sort((a, b) => a.sortTime - b.sortTime);
  }, [events, chores]);

  // Separate all-day and timed items per D-17
  const allDayItems = mergedItems.filter(i => i.isAllDay);
  const timedItems = mergedItems.filter(i => !i.isAllDay);

  return {
    events,
    chores,
    mergedItems,
    allDayItems,
    timedItems,
    loading,
    error,
    authStatus,
    refetch: fetchAll,
  };
}
