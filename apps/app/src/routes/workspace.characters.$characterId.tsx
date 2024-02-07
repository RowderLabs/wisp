import { FileRoute } from "@tanstack/react-router";
import { DraggableCanvas } from "@wisp/ui";
import { Banner } from "@wisp/ui";
import { rspc } from "@wisp/client";
import { useDebouncedPanelTransform } from "../hooks/useDebouncedPanelTransform";

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
  const { transformPanel } = useDebouncedPanelTransform({ duration: 1000 });
  const { data: canvasItems } = rspc.useQuery(["panels.find"], {
    placeholderData: panels,
    staleTime: Infinity,
  });

  //TODO: move into custom hook and apply optimistic updates.

  return (
    <div className="w-full" style={{ height: "100vh", overflowY: "auto" }}>
      <Banner className="bg-slate-300">
      </Banner>
      <div className="basis-full relative" style={{ height: "800px" }}>
        {canvasItems && <DraggableCanvas items={canvasItems} onItemTransform={transformPanel} />}
      </div>
    </div>
  );
}
