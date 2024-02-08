import { Button, Dialog, DialogProps, FileDropper, Form, InputField } from "@wisp/ui";
import { useDialogManager, useZodForm } from "@wisp/ui/src/hooks";
import { z } from "zod";

const schema = z.object({
  src: z.string(),
});

interface ImageUploadDialogProps extends DialogProps {}

export function ImageUploadDialog({ id, open, onOpenChange }: ImageUploadDialogProps) {
  const form = useZodForm({ schema });
  const [dialogManager] = useDialogManager();
  return (
    <Dialog id={id} open={open} onOpenChange={onOpenChange}>
      <FileDropper/>
    </Dialog>
  );
}
