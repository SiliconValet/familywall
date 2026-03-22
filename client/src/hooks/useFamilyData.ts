import { useState, useEffect, useCallback } from 'react';
import type { FamilyMember } from '../types/family';

export function useFamilyData() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/family');
      if (!res.ok) throw new Error('Failed to fetch family members');
      const data: FamilyMember[] = await res.json();
      setMembers(data); // Already sorted alphabetically by server (per D-08)
      setError(null);
    } catch (err) {
      setError('Unable to load family members. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (name: string) => {
    const res = await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) throw new Error('Failed to add family member');
    await fetchMembers(); // Re-fetch to get sorted list (per D-09)
  }, [fetchMembers]);

  const updateMember = useCallback(async (id: number, name: string) => {
    const res = await fetch(`/api/family/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) throw new Error('Failed to update family member');
    await fetchMembers(); // Re-fetch to get sorted list (per D-09)
  }, [fetchMembers]);

  const deleteMember = useCallback(async (id: number) => {
    const res = await fetch(`/api/family/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete family member');
    await fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, loading, error, addMember, updateMember, deleteMember, refetch: fetchMembers };
}
