import { Button, Dialog, DialogProps, Form, InputField } from "@wisp/ui";
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
      <Form
        form={form}
        onSubmit={(formData) => {
          dialogManager.removeDialog(id)
          return;
        }}
      >
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-col gap-2 justify-start">
            <InputField label="src" {...form.register("src")} id="src" name="src"/>
          </div>
        </div>
        <div>
          <Button variant="outline" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}
