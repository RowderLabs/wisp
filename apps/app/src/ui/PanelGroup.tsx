import { Panel, PanelProps, SortableGrid, createPanel } from "@wisp/ui";
import { ReactElement, JSXElementConstructor, useState } from "react";

export const PanelGroup = () => {
  const [panels, setPanels] = useState<Omit<PanelProps, "size">[]>([
    {id: 1, content: createPanel('image', {}).content,},
    {id: 2, content: createPanel('image', {}).content,},
    {id: 3, content: createPanel('image', {}).content,},
    {id: 4, content: createPanel('image', {}).content,}
  ]);

  return (
    <div>
        <SortableGrid
          gap={8}
          cols={8}
          defaultColumns={{colSpan: 2}}
          initialItems={panels}
          gridChild={(panel) => <Panel {...panel} />}
        />
    </div>
  );
};
