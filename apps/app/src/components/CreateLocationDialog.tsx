import { rspc, useUtils } from "@wisp/client";
import { Button, Dialog, DialogProps, Form, InputField } from "@wisp/ui";
import { useDialogManager, useZodForm } from "@wisp/ui/src/hooks";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3, "Name too short.").max(25, "Name too long"),
});

interface LocationDialogProps extends DialogProps {
  context: {
    path: string | null;
  };
}

export function CreateLocationsDialog({ open, onOpenChange, id, context }: LocationDialogProps) {
  const form = useZodForm({ schema });
  const [dialogManager] = useDialogManager();
  const utils = useUtils();

  const { mutate: createLocation } = rspc.useMutation(['locations.create'], {
    onSettled: () => {
      
    },
    onSuccess: () => {
      utils.invalidateQueries(['locations.tree']);
      dialogManager.removeDialog(id);
    },
  });

  return (
    <Dialog
      onInteractOutside={(e) => e.preventDefault()}
      id={id}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form
        form={form}
        onSubmit={(formData) => {
          createLocation({ name: formData.name, parent: context.path, isCollection: false });
        }}
      >
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex flex-col gap-2 justify-start">
            <InputField
              label="Character Name"
              {...form.register("name")}
              id="name"
              name="name"
              required
            />
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
