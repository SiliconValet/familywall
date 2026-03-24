import { useState } from 'react';
import type { Chore } from '@/types/chore';
import type { FamilyMember } from '@/types/family';
import { useLongPress } from '@/hooks/useLongPress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FamilyMemberBadge } from './FamilyMemberBadge';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit02Icon, Delete02Icon } from '@hugeicons/core-free-icons';

const DEFAULT_COLOR = '#039BE5';

interface ChoreCardProps {
  chore: Chore;
  colorIndex: number;
  onComplete: (id: number, completedBy?: number) => void;
  onEdit: (chore: Chore) => void;
  onDelete: (id: number) => void;
  familyMembers: FamilyMember[];
}

export function ChoreCard({
  chore,
  colorIndex: _colorIndex,
  onComplete,
  onEdit,
  onDelete,
  familyMembers,
}: ChoreCardProps) {
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);

  // Derive hex color from assigned family member
  const assignedMember = familyMembers.find(m => m.id === chore.assigned_to);
  const memberColor = assignedMember?.color || DEFAULT_COLOR;

  const isCompleted = chore.status !== 'active';
  const isMissed = chore.status === 'auto_completed';

  const longPressHandlers = useLongPress({
    onClick: () => {
      if (!isCompleted) {
        onComplete(chore.id);
      }
    },
    onLongPress: () => {
      if (!isCompleted) {
        setShowFamilyPicker(true);
      }
    },
    threshold: 1000,
  });

  const handleFamilyMemberSelect = (memberId: number) => {
    onComplete(chore.id, memberId);
    setShowFamilyPicker(false);
  };

  return (
    <>
      <div
        className="flex items-center gap-4 bg-card rounded-2xl p-4"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: memberColor,
          opacity: isCompleted ? 0.7 : 1,
        }}
      >
        {/* Checkbox with 48px touch target */}
        <div
          className="min-w-12 min-h-12 flex items-center justify-center"
          {...(isCompleted ? {} : longPressHandlers)}
        >
          <Checkbox
            checked={isCompleted}
            disabled={isCompleted}
            style={isCompleted ? { borderColor: memberColor, backgroundColor: memberColor } : {}}
          />
        </div>

        {/* Chore details */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`text-lg ${isMissed ? 'line-through' : ''}`}
            >
              {chore.title}
            </h3>
            {isMissed && (
              <span className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground">
                Missed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <FamilyMemberBadge name={chore.assignee_name} color={memberColor} />
            <span>{chore.assignee_name}</span>
          </div>
        </div>

        {/* Points and actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm bg-muted px-2 py-1 rounded">
            {chore.points}pts
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-12 min-w-12"
            onClick={() => onEdit(chore)}
            aria-label="Edit chore"
          >
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="min-h-12 min-w-12"
            onClick={() => onDelete(chore.id)}
            aria-label="Delete chore"
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Family member picker dialog */}
      <Dialog open={showFamilyPicker} onOpenChange={setShowFamilyPicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who completed this?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {familyMembers.map((member) => (
              <Button
                key={member.id}
                className="min-h-12"
                onClick={() => handleFamilyMemberSelect(member.id)}
              >
                {member.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
