import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NewGameConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function NewGameConfirmDialog({ open, onClose, onConfirm }: NewGameConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Game?</DialogTitle>
          <DialogDescription>
            Reset board and start fresh? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="min-h-12"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="min-h-12"
            onClick={handleConfirm}
          >
            Start New Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
