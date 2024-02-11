import { Button, Dialog, DialogProps } from "@wisp/ui";
import { useDialogManager } from "@wisp/ui/src/hooks";

interface ConfirmationDialogProps extends DialogProps {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmationDialog({ id, open, onOpenChange, message, onConfirm, onCancel }: ConfirmationDialogProps) {
  const [dialogManager] = useDialogManager();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    dialogManager.removeDialog(id);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    dialogManager.removeDialog(id);
  };

  return (
    <Dialog onInteractOutside={(e) => e.preventDefault()} id={id} open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-4">
        <p>{message}</p>
        <div className="flex gap-2">
          <Button onClick={handleConfirm} variant="fill">
            Confirm
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
