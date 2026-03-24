import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FamilyMember } from '@/types/family';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';

interface FamilyCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

export function FamilyCard({ member, onEdit, onDelete }: FamilyCardProps) {
  return (
    <Card className="min-h-14 p-4" style={{ borderLeftWidth: '4px', borderLeftColor: member.color }}>
      <CardContent className="p-0 flex items-center justify-between">
        <span className="text-lg font-normal">{member.name}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="touch-target"
            onClick={() => onEdit(member)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="touch-target text-destructive"
            onClick={() => onDelete(member)}
          >
            <HugeiconsIcon icon={Delete02Icon} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
