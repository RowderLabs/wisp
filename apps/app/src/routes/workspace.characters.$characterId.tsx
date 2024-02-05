import { FileRoute } from "@tanstack/react-router";
import { DraggableCanvas, TransformEvent, Toolbar } from "@wisp/ui";

import React, { useEffect, useState } from "react";
import { Banner } from "@wisp/ui";
import { rspc } from "@wisp/client";
import { useDebounce } from "@uidotdev/usehooks";
import { HiDocumentText, HiMiniDocumentText, HiPhoto } from "react-icons/hi2";
import { HiTable } from "react-icons/hi";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: ({ context }) =>
    context.rspc.queryClient.ensureQueryData({
      queryKey: ["panels.find"],
      queryFn: () => context.rspc.client.query(["panels.find"]),
    }),
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  const panels = Route.useLoaderData();
  const [draft, setDraft] = useState<Omit<TransformEvent, "type"> | undefined>(undefined);
  const [debounceState, setDebounceState] = useState("idle");
  const debouncedDraft = useDebounce(draft, 1000);

  useEffect(() => {
    if (!debouncedDraft) return;
    setDebounceState("committing");
    commitTransform({
      id: debouncedDraft.id,
      transform: {
        x: debouncedDraft.x,
        y: debouncedDraft.y,
        width: debouncedDraft.width,
        height: debouncedDraft.height,
      },
    });
  }, [debouncedDraft]);

  useEffect(() => {});

  const queryClient = rspc.useContext().queryClient;
  const { data: canvasItems } = rspc.useQuery(["panels.find"], { placeholderData: panels, staleTime: Infinity });

  //TODO: move into custom hook and apply optimistic updates.
  const { mutate: commitTransform } = rspc.useMutation("panels.transform", {
    onSuccess: () => {
      setDebounceState("idle");
    },
    onError: (e) => {
      console.error(e);
    },
  });
  const transform = React.useCallback((event: TransformEvent) => {
    queryClient.setQueryData<{ id: string; x: number; y: number; width: number; height: number }[]>(
      ["panels.find"],
      [{ ...event }]
    );
    setDraft(event);
  }, []);

  return (
    <div className="w-full" style={{ height: "100vh", overflowY: "auto" }}>
      <Banner className="bg-slate-300">
        <p className="text-lg font-semibold">{debounceState}</p>
      </Banner>
      <div className="basis-full relative" style={{ height: "800px" }}>
        
        {canvasItems && <DraggableCanvas items={canvasItems} onItemTransform={transform} />}
      </div>
    </div>
  );
}
