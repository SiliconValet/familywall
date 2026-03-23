import { useState } from 'react';
import { useChoreData } from '@/hooks/useChoreData';
import { useFamilyData } from '@/hooks/useFamilyData';
import { usePinAuth } from '@/hooks/usePinAuth';
import { formatWeekRange } from '@/utils/date-filters';
import type { Chore, ChoreFormData } from '@/types/chore';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PinModal } from './PinModal';
import { ChoreCard } from './ChoreCard';
import { ChoreFormModal } from './ChoreFormModal';
import { CompletedSection } from './CompletedSection';
import { CelebrationMessage } from './CelebrationMessage';
import { FamilyMemberBadge } from './FamilyMemberBadge';

export function ChoreList() {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { activeChores, completedChores, stats, loading, error, createChore, updateChore, completeChore, deleteChore } = useChoreData(viewMode);
  const { members } = useFamilyData();
  const { withPinAuth, showPinModal, closePinModal, verifyPin, isVerifying, pinError, clearError } = usePinAuth();

  // Create stable color index mapping for family members
  const colorIndexMap = new Map(members.map((m, i) => [m.id, i]));

  const handleAddChore = () => {
    withPinAuth(async () => setShowAddForm(true));
  };

  const handleEditChore = (chore: Chore) => {
    withPinAuth(async () => setEditingChore(chore));
  };

  const handleDeleteChore = (id: number) => {
    withPinAuth(async () => setDeleteTarget(id));
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget !== null) {
      await deleteChore(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleCreateChore = async (data: ChoreFormData) => {
    await createChore(data);
    setShowAddForm(false);
  };

  const handleUpdateChore = async (data: ChoreFormData) => {
    if (editingChore) {
      await updateChore(editingChore.id, data);
      setEditingChore(null);
    }
  };

  const weekRange = viewMode === 'weekly' ? formatWeekRange() : '';

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold font-serif">
          {viewMode === 'daily' ? "Today's Chores" : "This Week's Chores"}
        </h1>
        <Button className="min-h-12" onClick={handleAddChore}>
          Add Chore
        </Button>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as 'daily' | 'weekly')}
          variant="outline"
          spacing={0}
        >
          <ToggleGroupItem value="daily" className="min-h-12">
            Today
          </ToggleGroupItem>
          <ToggleGroupItem value="weekly" className="min-h-12">
            This Week
          </ToggleGroupItem>
        </ToggleGroup>
        {viewMode === 'weekly' && weekRange && (
          <p className="text-sm text-muted-foreground mt-2">{weekRange}</p>
        )}
      </div>

      {/* Stats Display (per CHOR-11) */}
      {stats.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4">
          {stats.map((stat) => {
            const colorIndex = colorIndexMap.get(stat.member_id) || 0;
            return (
              <div key={stat.member_id} className="flex items-center gap-2">
                <FamilyMemberBadge name={stat.member_name} colorIndex={colorIndex} />
                <span className="text-sm">
                  {stat.member_name}: {stat.completed_count} done
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        // Loading skeleton
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        // Error state
        <div className="text-center py-16">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : activeChores.length === 0 && completedChores.length === 0 ? (
        // Empty state: no chores yet (D-26)
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">No Chores Yet</h2>
          <p className="text-muted-foreground">Tap Add Chore to create your first task.</p>
        </div>
      ) : activeChores.length === 0 && completedChores.length > 0 && viewMode === 'daily' ? (
        // All done for today (D-27)
        <CelebrationMessage />
      ) : activeChores.length === 0 && viewMode === 'weekly' ? (
        // No chores this week (D-28)
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">No Chores This Week</h2>
          <p className="text-muted-foreground">
            You're all caught up for {weekRange}. New chores will appear here when created.
          </p>
        </div>
      ) : (
        // Normal state: active chores list
        <div className="space-y-2">
          {activeChores.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              colorIndex={colorIndexMap.get(chore.assigned_to) || 0}
              onComplete={completeChore}
              onEdit={handleEditChore}
              onDelete={handleDeleteChore}
              familyMembers={members}
            />
          ))}
        </div>
      )}

      {/* Completed Section */}
      <CompletedSection
        chores={completedChores}
        colorIndexMap={colorIndexMap}
        onEdit={handleEditChore}
        onDelete={handleDeleteChore}
        familyMembers={members}
      />

      {/* PIN Modal */}
      <PinModal
        open={showPinModal}
        onClose={closePinModal}
        onVerify={verifyPin}
        isVerifying={isVerifying}
        error={pinError}
        onClearError={clearError}
      />

      {/* Add Chore Modal */}
      <ChoreFormModal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleCreateChore}
        familyMembers={members}
      />

      {/* Edit Chore Modal */}
      <ChoreFormModal
        open={!!editingChore}
        onClose={() => setEditingChore(null)}
        onSubmit={handleUpdateChore}
        familyMembers={members}
        initialData={editingChore || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete This Chore?</DialogTitle>
            <DialogDescription>
              This chore will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="min-h-12 flex-1"
              onClick={() => setDeleteTarget(null)}
            >
              Keep Chore
            </Button>
            <Button
              variant="destructive"
              className="min-h-12 flex-1"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
