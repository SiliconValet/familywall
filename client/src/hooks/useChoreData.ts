import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Chore, ChoreFormData, ChoreStats } from '../types/chore';

type ViewMode = 'daily' | 'weekly';

export function useChoreData(view: ViewMode = 'daily') {
  const [chores, setChores] = useState<Chore[]>([]);
  const [stats, setStats] = useState<ChoreStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chores?view=${view}`);
      if (!res.ok) throw new Error('Failed to fetch chores');
      const data: Chore[] = await res.json();
      setChores(data);
      setError(null);
    } catch {
      setError('Unable to load chores. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [view]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/chores/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data: ChoreStats[] = await res.json();
      setStats(data);
    } catch {
      // Stats are non-critical, silently fail
    }
  }, []);

  const createChore = useCallback(async (data: ChoreFormData) => {
    const body = {
      ...data,
      is_recurring: data.is_recurring ? 1 : 0,
      recurrence_config: data.recurrence_config || null,
    };
    const res = await fetch('/api/chores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to create chore');
    await fetchChores();
    toast.success('Chore added successfully');
  }, [fetchChores]);

  const updateChore = useCallback(async (id: number, data: Partial<ChoreFormData>) => {
    const body = {
      ...data,
      is_recurring: data.is_recurring !== undefined ? (data.is_recurring ? 1 : 0) : undefined,
      recurrence_config: data.recurrence_config || null,
    };
    const res = await fetch(`/api/chores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update chore');
    await fetchChores();
    toast.success('Chore updated successfully');
  }, [fetchChores]);

  // Per D-06: completed_by defaults to assignee (handled server-side)
  // Per D-19: 5-second undo toast with action button
  const completeChore = useCallback(async (id: number, completedBy?: number) => {
    const res = await fetch(`/api/chores/${id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_by: completedBy }),
    });
    if (!res.ok) {
      toast.error('Unable to mark complete. Please try again.');
      throw new Error('Failed to complete chore');
    }
    await fetchChores();
    await fetchStats();

    toast.success('Chore completed', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: async () => {
          await undoComplete(id);
        },
      },
    });
  }, [fetchChores, fetchStats]);

  const undoComplete = useCallback(async (id: number) => {
    const res = await fetch(`/api/chores/${id}/undo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to undo');
    await fetchChores();
    await fetchStats();
    toast.info('Completion undone');
  }, [fetchChores, fetchStats]);

  const deleteChore = useCallback(async (id: number) => {
    const res = await fetch(`/api/chores/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete chore');
    await fetchChores();
    toast.success('Chore deleted');
  }, [fetchChores]);

  useEffect(() => {
    fetchChores();
    fetchStats();
  }, [fetchChores, fetchStats]);

  // Derived state: separate active and completed chores
  const activeChores = chores.filter(c => c.status === 'active');
  const completedChores = chores.filter(c => c.status === 'completed' || c.status === 'auto_completed');

  return {
    chores,
    activeChores,
    completedChores,
    stats,
    loading,
    error,
    createChore,
    updateChore,
    completeChore,
    undoComplete,
    deleteChore,
    refetch: fetchChores,
  };
}
