import { rspc } from "@wisp/client";
import { TransformEvent } from "../Transform";
import { Panel } from "@wisp/client/src/bindings";
import { useState } from "react";


export interface DraggableCanvasArgs {
  entityId: string;
  preloaded?: { id: string; panels: Panel[]; entityId: string };
  onItemDelete: (id: string) => void;
  onItemTransform: (event: TransformEvent) => void;
}

export const useDraggableCanvas = (args: DraggableCanvasArgs) => {
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const {onItemTransform, onItemDelete} = args;

  const { data: canvas } = rspc.useQuery(["canvas.for_entity", args.entityId], {
    placeholderData: args.preloaded,
  });

  const onSelectionChange = (id: string | undefined) => {
    setSelected(id)
  }

  if (!canvas) throw new Error("TODO: handle canvas does not exist")

  return [
    { items: canvas.panels, id: canvas.id, selected },
    { onItemDelete, onItemTransform, onSelectionChange},
  ] as const;
};