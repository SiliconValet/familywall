import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FamilyMemberBadge } from '../FamilyMemberBadge';
import type { FamilyMember } from '../../types/family';

interface PlayerPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (playerId: number | null) => void;
  title: string;
  members: FamilyMember[];
}

export function PlayerPickerModal({ open, onClose, onSelect, title, members }: PlayerPickerModalProps) {
  const handleSelect = (playerId: number | null) => {
    onSelect(playerId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {members.map((member, index) => (
            <button
              key={member.id}
              className="flex items-center gap-3 px-3 min-h-[48px] rounded-lg hover:bg-muted active:bg-muted/80 text-left w-full transition-colors"
              onClick={() => handleSelect(member.id)}
            >
              <FamilyMemberBadge name={member.name} colorIndex={index} />
              <span className="text-base font-medium">{member.name}</span>
            </button>
          ))}
          <button
            className="flex items-center gap-3 px-3 min-h-[48px] rounded-lg hover:bg-muted active:bg-muted/80 text-left w-full transition-colors text-muted-foreground"
            onClick={() => handleSelect(null)}
          >
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-xs">
              —
            </div>
            <span className="text-base">None</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
