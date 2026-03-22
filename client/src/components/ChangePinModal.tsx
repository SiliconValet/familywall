import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ChangePinModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePinModal({ open, onClose }: ChangePinModalProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    }
  }, [open]);

  const validateField = (field: string, value: string): string | null => {
    if (!value.trim()) {
      return 'This field is required';
    }

    if (field === 'newPin') {
      if (!/^\d{4,6}$/.test(value)) {
        return 'PIN must be 4-6 digits';
      }
    }

    if (field === 'confirmPin') {
      if (value !== newPin) {
        return 'PINs do not match';
      }
    }

    return null;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, value);
    if (error) {
      setErrors({ ...errors, [field]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const allTouched = { currentPin: true, newPin: true, confirmPin: true };
    setTouched(allTouched);

    const validationErrors: { [key: string]: string } = {};
    ['currentPin', 'newPin', 'confirmPin'].forEach((field) => {
      const value = field === 'currentPin' ? currentPin : field === 'newPin' ? newPin : confirmPin;
      const error = validateField(field, value);
      if (error) {
        validationErrors[field] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/settings/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      });

      if (res.status === 403) {
        setErrors({ currentPin: 'Current PIN is incorrect' });
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to change PIN');
      }

      toast('PIN changed successfully');
      onClose();
    } catch (err) {
      setErrors({ submit: 'Failed to change PIN. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Parental PIN</DialogTitle>
          <DialogDescription>
            Enter your current PIN and choose a new one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="currentPin">Current PIN</Label>
              <Input
                id="currentPin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="min-h-11 mt-2"
                value={currentPin}
                onChange={(e) => {
                  setCurrentPin(e.target.value);
                  if (touched.currentPin) {
                    handleBlur('currentPin', e.target.value);
                  }
                }}
                onBlur={() => handleBlur('currentPin', currentPin)}
                disabled={isSubmitting}
              />
              {touched.currentPin && errors.currentPin && (
                <p className="text-destructive text-sm mt-1">{errors.currentPin}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPin">New PIN</Label>
              <Input
                id="newPin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="min-h-11 mt-2"
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value);
                  if (touched.newPin) {
                    handleBlur('newPin', e.target.value);
                  }
                }}
                onBlur={() => handleBlur('newPin', newPin)}
                disabled={isSubmitting}
              />
              {touched.newPin && errors.newPin && (
                <p className="text-destructive text-sm mt-1">{errors.newPin}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPin">Confirm New PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="min-h-11 mt-2"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value);
                  if (touched.confirmPin) {
                    handleBlur('confirmPin', e.target.value);
                  }
                }}
                onBlur={() => handleBlur('confirmPin', confirmPin)}
                disabled={isSubmitting}
              />
              {touched.confirmPin && errors.confirmPin && (
                <p className="text-destructive text-sm mt-1">{errors.confirmPin}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-destructive text-sm">{errors.submit}</p>
            )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing...' : 'Change PIN'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
