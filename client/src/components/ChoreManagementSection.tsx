import { useState } from 'react';
import { useChoreData } from '@/hooks/useChoreData';
import { useFamilyData } from '@/hooks/useFamilyData';
import { usePinAuth } from '@/hooks/usePinAuth';
import { ChoreFormModal } from './ChoreFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { PinModal } from './PinModal';
import { Button } from '@/components/ui/button';
import type { Chore, RecurrenceConfig } from '@/types/chore';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_COLOR = '#039BE5';

function describeSchedule(chore: Chore): string {
  if (!chore.is_recurring) return 'One-time';
  if (!chore.recurrence_config) return 'Recurring';
  try {
    const config: RecurrenceConfig = JSON.parse(chore.recurrence_config);
    switch (config.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
      case 'custom': {
        const dayNames = config.days.map(d => DAY_NAMES[d]).join(', ');
        return `Weekly: ${dayNames}`;
      }
      case 'interval': {
        const n = config.interval || 2;
        const start = config.startDate ? ` starting ${config.startDate}` : '';
        return `Every ${n} days${start}`;
      }
      default:
        return 'Recurring';
    }
  } catch {
    return 'Recurring';
  }
}

export function ChoreManagementSection() {
  const { chores, loading, createChore, updateChore, deleteChore } = useChoreData('templates');
  const { members } = useFamilyData();
  const { verifyPin, isVerifying, pinError, clearError, withPinAuth, showPinModal, closePinModal } = usePinAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [deletingChore, setDeletingChore] = useState<Chore | null>(null);

  const handleDelete = async () => {
    if (deletingChore) {
      await deleteChore(deletingChore.id);
      setDeletingChore(null);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-2xl font-semibold">Chores</h2>
        <Button
          className="touch-target"
          onClick={() => withPinAuth(async () => setShowAddModal(true))}
        >
          Add Chore
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading chores...</p>
      ) : chores.length === 0 ? (
        <p className="text-muted-foreground">No chores defined yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {chores.map((chore) => {
            const memberColor = members.find(m => m.id === chore.assigned_to)?.color || DEFAULT_COLOR;
            return (
            <div
              key={chore.id}
              className="flex items-center justify-between rounded-lg bg-card px-4 py-3"
              style={{ borderLeftWidth: '4px', borderLeftColor: memberColor }}
            >
              <div>
                <p className="font-medium">{chore.title}</p>
                <p className="text-sm text-muted-foreground">
                  {chore.assignee_name} · {describeSchedule(chore)}
                  {chore.points > 0 ? ` · ${chore.points} pts` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => withPinAuth(async () => setEditingChore(chore))}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => withPinAuth(async () => setDeletingChore(chore))}
                >
                  Delete
                </Button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <PinModal
        open={showPinModal}
        onClose={closePinModal}
        onVerify={verifyPin}
        isVerifying={isVerifying}
        error={pinError}
        onClearError={clearError}
      />

      <ChoreFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createChore}
        familyMembers={members}
      />

      <ChoreFormModal
        open={!!editingChore}
        onClose={() => setEditingChore(null)}
        onSubmit={(data) => updateChore(editingChore!.id, data)}
        familyMembers={members}
        initialData={editingChore || undefined}
      />

      <DeleteConfirmModal
        open={!!deletingChore}
        onClose={() => setDeletingChore(null)}
        onConfirm={handleDelete}
        memberName={deletingChore?.title || ''}
      />
    </div>
  );
}
