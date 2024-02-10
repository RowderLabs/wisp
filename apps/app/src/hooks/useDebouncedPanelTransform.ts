import { rspc } from "@wisp/client";
import { Panel } from "@wisp/client/src/bindings";
import { TransformEvent } from "@wisp/ui";
import { useDebouncedDraft } from "@wisp/ui/src/hooks";
import type { UseDebouncedDraftArgs } from "@wisp/ui/src/hooks";
import React from "react";

export function useDebouncedPanelTransform({
  duration,
}: Omit<UseDebouncedDraftArgs<TransformEvent>, "callback">) {
  const queryClient = rspc.useContext().queryClient;
  const { mutate: commitTransform } = rspc.useMutation("panels.transform", {
    onError: (e) => {
      console.error(e);
    },
  });
  const [draft, setDraft] = useDebouncedDraft<TransformEvent>({ duration, callback: commitTransform });

  //we need more than to perform optimistic update because we only want to commit to sending state to server after delay
  const transformPanel = React.useCallback((event: TransformEvent) => {
    const oldPanel = (queryClient.getQueryData(['panels.find']) as Panel[]).find(item => item.id === event.id) as Panel
    const prev = (queryClient.getQueryData(['panels.find']) as Panel[]).filter(item => item.id !== event.id)
    queryClient.setQueryData<Panel[]>(
      ["panels.find"],
      [...prev, { ...event, content: oldPanel.content, panelType: oldPanel.panelType }]
    );
    setDraft(event);
  }, []);

  return {draft, transformPanel}

}
