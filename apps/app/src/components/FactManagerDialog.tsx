import { Dialog, DialogProps } from "@wisp/ui";
import { FactManager } from "./FactManager";
import { EntityType } from "@wisp/client/src/bindings";

interface CharacterDialogProps extends DialogProps {
  context: {
    entityId: string;
    entityType: EntityType;
  };
}

export function FactManagerDialog({ open, onOpenChange, id, context }: CharacterDialogProps) {
  return (
    <Dialog id={id} open={open} onOpenChange={onOpenChange}>
      <FactManager {...context}/>
    </Dialog>
  );
}
