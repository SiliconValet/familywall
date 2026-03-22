import { useState } from 'react';
import { useFamilyData } from '@/hooks/useFamilyData';
import { usePinAuth } from '@/hooks/usePinAuth';
import { FamilyCard } from './FamilyCard';
import { FamilyFormModal } from './FamilyFormModal';
import { PinModal } from './PinModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ChangePinModal } from './ChangePinModal';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings02Icon } from '@hugeicons/core-free-icons';
import { FamilyMember } from '@/types/family';
import { toast } from 'sonner';

export function FamilyList() {
  const { members, loading, error, addMember, updateMember, deleteMember, refetch } = useFamilyData();
  const { verifyPin, isVerifying, pinError, clearError, withPinAuth, showPinModal, closePinModal } = usePinAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [showChangePinModal, setShowChangePinModal] = useState(false);

  const handleAdd = async (name: string) => {
    await addMember(name);
    toast('Family member added successfully');
  };

  const handleEdit = async (name: string) => {
    if (editingMember) {
      await updateMember(editingMember.id, name);
      toast('Family member updated successfully');
      setEditingMember(null);
    }
  };

  const handleDelete = async () => {
    if (deletingMember) {
      await deleteMember(deletingMember.id);
      toast('Family member deleted');
      setDeletingMember(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <Button onClick={refetch} className="touch-target">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold">Family Members</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="touch-target"
            onClick={() => setShowChangePinModal(true)}
          >
            <HugeiconsIcon icon={Settings02Icon} />
          </Button>
          <Button
            className="touch-target"
            onClick={() => withPinAuth(async () => setShowAddModal(true))}
          >
            Add Family Member
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">No Family Members Yet</h2>
          <p className="text-muted-foreground mb-6">
            Add your first family member to get started. Tap the button below to begin.
          </p>
          <Button
            className="touch-target"
            onClick={() => withPinAuth(async () => setShowAddModal(true))}
          >
            Add Family Member
          </Button>
        </div>
      ) : (
        /* Family List */
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <FamilyCard
              key={member.id}
              member={member}
              onEdit={(m) => withPinAuth(async () => setEditingMember(m))}
              onDelete={(m) => withPinAuth(async () => setDeletingMember(m))}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <PinModal
        open={showPinModal}
        onClose={closePinModal}
        onVerify={verifyPin}
        isVerifying={isVerifying}
        error={pinError}
        onClearError={clearError}
      />

      <FamilyFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        mode="add"
      />

      <FamilyFormModal
        open={!!editingMember}
        onClose={() => setEditingMember(null)}
        onSubmit={handleEdit}
        initialName={editingMember?.name}
        mode="edit"
      />

      <DeleteConfirmModal
        open={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDelete}
        memberName={deletingMember?.name || ''}
      />

      <ChangePinModal
        open={showChangePinModal}
        onClose={() => setShowChangePinModal(false)}
      />
    </div>
  );
}
