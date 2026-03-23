import { useState } from 'react';
import type { Chore } from '@/types/chore';
import type { FamilyMember } from '@/types/family';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChoreCard } from './ChoreCard';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';

interface CompletedSectionProps {
  chores: Chore[];
  colorIndexMap: Map<number, number>;
  onEdit: (chore: Chore) => void;
  onDelete: (id: number) => void;
  familyMembers: FamilyMember[];
}

export function CompletedSection({
  chores,
  colorIndexMap,
  onEdit,
  onDelete,
  familyMembers,
}: CompletedSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Hidden when no completed chores (D-14)
  if (chores.length === 0) {
    return null;
  }

  const noOp = () => {}; // No-op for onComplete since already completed

  return (
    <div className="mt-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full min-h-12 text-sm text-muted-foreground border-t border-border pt-4"
          >
            <span>Completed ({chores.length})</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="transition-all duration-300 ease-in-out">
          <div className="flex flex-col gap-2 mt-4">
            {chores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                colorIndex={colorIndexMap.get(chore.assigned_to) || 0}
                onComplete={noOp}
                onEdit={onEdit}
                onDelete={onDelete}
                familyMembers={familyMembers}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
