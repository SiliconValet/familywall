import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PinModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  isVerifying: boolean;
  error: string | null;
  onClearError: () => void;
}

export function PinModal({ open, onClose, onVerify, isVerifying, error, onClearError }: PinModalProps) {
  const [pin, setPin] = useState('');

  // Clear PIN when modal opens or when there's an error
  useEffect(() => {
    if (open) {
      setPin('');
    }
  }, [open]);

  useEffect(() => {
    if (error) {
      setPin('');
    }
  }, [error]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4 && !isVerifying) {
      const newPin = pin + digit;
      setPin(newPin);
      onClearError();

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        onVerify(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (!isVerifying) {
      setPin(pin.slice(0, -1));
      onClearError();
    }
  };

  const handleCancel = () => {
    setPin('');
    onClearError();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Parental PIN</DialogTitle>
          <DialogDescription>
            This action requires parental authorization.
          </DialogDescription>
        </DialogHeader>

        {/* PIN Display - 4 circles showing entered digits */}
        <div className="flex justify-center gap-2 my-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-11 h-11 rounded-full border-2 border-border flex items-center justify-center"
            >
              {pin.length > i && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>

        {/* Numeric Keypad - 3x4 grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              className="w-14 h-14 text-lg font-semibold touch-target"
              onClick={() => handleDigit(num.toString())}
              disabled={isVerifying}
            >
              {num}
            </Button>
          ))}
          <div /> {/* Empty cell */}
          <Button
            variant="outline"
            className="w-14 h-14 text-lg font-semibold touch-target"
            onClick={() => handleDigit('0')}
            disabled={isVerifying}
          >
            0
          </Button>
          <Button
            variant="outline"
            className="w-14 h-14 text-lg font-semibold touch-target"
            onClick={handleBackspace}
            disabled={isVerifying}
          >
            ⌫
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-destructive text-sm text-center mb-2">
            {error}
          </div>
        )}

        {/* Cancel Button */}
        <Button
          variant="secondary"
          className="w-full min-h-11 touch-target"
          onClick={handleCancel}
          disabled={isVerifying}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
