import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FamilyFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialName?: string;
  mode: 'add' | 'edit';
}

export function FamilyFormModal({ open, onClose, onSubmit, initialName = '', mode }: FamilyFormModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName(initialName);
      setError(null);
      setTouched(false);
      setIsSubmitting(false);
    }
  }, [open, initialName]);

  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Name is required';
    }
    if (trimmed.length > 100) {
      return 'Name must be less than 100 characters';
    }
    return null;
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validateName(name);
    setError(validationError);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = !validateName(name);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Family Member' : 'Edit Family Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                className="min-h-11 mt-2"
                placeholder="Family member name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched) {
                    setError(validateName(e.target.value));
                  }
                }}
                onBlur={handleBlur}
                disabled={isSubmitting}
                autoFocus
                aria-invalid={touched && !!error}
              />
              {touched && error && (
                <p className="text-destructive text-sm mt-1">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 touch-target"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-h-11 touch-target"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Member' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
