import { useState, useEffect } from 'react';
import type { Chore, ChoreFormData, RecurrenceConfig as RecurrenceConfigType } from '@/types/chore';
import type { FamilyMember } from '@/types/family';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecurrenceConfig } from './RecurrenceConfig';
import { toast } from 'sonner';

interface ChoreFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChoreFormData) => Promise<void>;
  familyMembers: FamilyMember[];
  initialData?: Chore;
}

export function ChoreFormModal({
  open,
  onClose,
  onSubmit,
  familyMembers,
  initialData,
}: ChoreFormModalProps) {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfigType>({
    frequency: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; assignedTo?: string }>({});

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setAssignedTo(initialData.assigned_to);
        setPoints(initialData.points);
        setDescription(initialData.description || '');
        setIsRecurring(!!initialData.is_recurring);

        if (initialData.recurrence_config) {
          try {
            const config = JSON.parse(initialData.recurrence_config);
            setRecurrenceConfig(config);
          } catch (e) {
            console.error('Failed to parse recurrence config:', e);
          }
        }
      } else {
        // Reset to defaults for new chore
        setTitle('');
        setAssignedTo(null);
        setPoints(0);
        setDescription('');
        setIsRecurring(false);
        setRecurrenceConfig({
          frequency: 'daily',
          days: [0, 1, 2, 3, 4, 5, 6],
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const newErrors: { title?: string; assignedTo?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Chore title is required';
    }

    if (assignedTo === null) {
      newErrors.assignedTo = 'Assigned family member is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: ChoreFormData = {
        title,
        assigned_to: assignedTo!,
        description: description || undefined,
        points: points || undefined,
        is_recurring: isRecurring,
        recurrence_config: isRecurring ? recurrenceConfig : undefined,
      };

      await onSubmit(formData);
      onClose();
    } catch (error) {
      const message = initialData
        ? 'Unable to update chore. Please try again.'
        : 'Unable to create chore. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Chore' : 'Add Chore'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chore Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Chore Title</Label>
            <Input
              id="title"
              placeholder="Enter chore title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-12"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select
              value={assignedTo?.toString() || ''}
              onValueChange={(value) => setAssignedTo(parseInt(value, 10))}
            >
              <SelectTrigger id="assignedTo" className="min-h-12 w-full">
                <SelectValue placeholder="Select family member..." />
              </SelectTrigger>
              <SelectContent>
                {familyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedTo && (
              <p className="text-sm text-destructive">{errors.assignedTo}</p>
            )}
          </div>

          {/* Points (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="points">Points (Optional)</Label>
            <Input
              id="points"
              type="number"
              placeholder="0"
              min={0}
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
              className="min-h-12"
            />
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="recurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
            />
            <Label htmlFor="recurring">Recurring</Label>
          </div>

          {/* Recurrence Config (conditional) */}
          {isRecurring && (
            <RecurrenceConfig value={recurrenceConfig} onChange={setRecurrenceConfig} />
          )}

          {/* Form Actions */}
          <div className="flex gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              className="min-h-12 flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-h-12 flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : initialData
                ? 'Save Changes'
                : 'Add Chore'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
