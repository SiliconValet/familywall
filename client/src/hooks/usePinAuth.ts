import { useState, useCallback } from 'react';

interface UsePinAuthReturn {
  verifyPin: (pin: string) => Promise<boolean>;
  isVerifying: boolean;
  pinError: string | null;
  clearError: () => void;
  withPinAuth: (action: () => Promise<void>) => void;
  showPinModal: boolean;
  closePinModal: () => void;
}

export function usePinAuth(): UsePinAuthReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  const clearError = useCallback(() => setPinError(null), []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    setIsVerifying(true);
    setPinError(null);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) throw new Error('Verification failed');
      const data: { valid: boolean } = await res.json();
      if (!data.valid) {
        setPinError('Incorrect PIN. Please try again.');
        return false;
      }
      // PIN valid - execute pending action
      if (pendingAction) {
        await pendingAction();
        setPendingAction(null);
      }
      setShowPinModal(false);
      return true;
    } catch {
      setPinError('Unable to verify PIN. Please try again.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [pendingAction]);

  const withPinAuth = useCallback((action: () => Promise<void>) => {
    setPendingAction(() => action);
    setPinError(null);
    setShowPinModal(true);
  }, []);

  const closePinModal = useCallback(() => {
    setShowPinModal(false);
    setPendingAction(null);
    setPinError(null);
  }, []);

  return { verifyPin, isVerifying, pinError, clearError, withPinAuth, showPinModal, closePinModal };
}
