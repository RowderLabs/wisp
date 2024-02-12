import { Dialog, DialogProps, FileDropper } from "@wisp/ui";
import { useDialogManager } from "@wisp/ui/src/hooks";

interface ImageUploadDialogProps extends DialogProps {
  onUpload: (path: string) => void;
}

export function ImageUploadDialog({ id, open, onOpenChange, onUpload }: ImageUploadDialogProps) {
  const [dialogManager] = useDialogManager();

  const handleUpload = (path: string) => {
    onUpload(path);
    afterUpload();
  };

  const afterUpload = () => {
    dialogManager.removeDialog(id);
  };
  return (
    <Dialog id={id} open={open} onOpenChange={onOpenChange}>
      <FileDropper onSubmitFile={handleUpload} />
    </Dialog>
  );
}
