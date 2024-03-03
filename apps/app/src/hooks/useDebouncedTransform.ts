import { rspc, useUtils } from "@wisp/client";
import { TransformEvent } from "@wisp/ui";
import { useDebouncedDraft } from "@wisp/ui/src/hooks";
import React from "react";

export function useDebouncedTransform({entityId}: {entityId: string}) {
  const utils = useUtils();
  
  const { mutate: commitTransform } = rspc.useMutation("panels.transform", {
    onError: (e) => {
      console.error(e);
    },
  });

  const [draft, setDraft] = useDebouncedDraft<TransformEvent>({
    duration: 500,
    callback: commitTransform,
  });

  React.useLayoutEffect(() => {
    if (!draft) return;
    const cachedQueryData = utils.getQueryData(["canvas.for_entity", entityId]);
    const cachedPanel = cachedQueryData?.panels.find((panel) => panel.id === draft?.id);
    const cachedPanels = cachedQueryData?.panels.filter((panel) => panel.id !== draft?.id);

    if (cachedQueryData && cachedPanel && cachedPanels) {
      utils.setQueryData(["canvas.for_entity", entityId], {
        ...cachedQueryData,
        panels: [...cachedPanels, { ...cachedPanel, ...draft }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return [setDraft] as const
}