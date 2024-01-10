import { FileRoute } from "@tanstack/react-router";
import { JotaiResizeHandle, JotaiTransform } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";
import { DndContext, UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import { useResize, useTransform } from "@wisp/ui/src/hooks";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: ({ context, params }) =>
    context.rspc.queryClient.ensureQueryData({
      queryKey: ["characters.with_id", { id: params.characterId }],
      queryFn: () => context.rspc.client.query(["characters.with_id", params.characterId]),
    }),
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  const character = Route.useLoaderData();

  return (
    <div className="flex w-full px-4">
      <div className="basis-full relative" style={{ height: "800px" }}>
        <DndContext>
          <JotaiTransform id={"box"} initial={{ width: 150, height: 150, x: 300, y: 300 }}>
            <JotaiBox />
          </JotaiTransform>
        </DndContext>
      </div>
      {character && <CharacterSummary name={character?.fullName} />}
    </div>
  );
}

function JotaiBox() {
  const { transform, transformId } = useTransform();
  const { lastHandlePosition } = useResize();

  return (
    <div
      style={{ left: transform.x, top: transform.y, ...transform }}
      className="relative rounded-md bg-slate-300 flex justify-center items-center"
    >
      <p>
        {JSON.stringify(transformId)} {JSON.stringify(transform)}
      </p>
      <JotaiResizeHandle position="top-right" />
      <JotaiResizeHandle position="bottom-right" />
      <JotaiResizeHandle position="bottom-left" />
      <JotaiResizeHandle position="top-left" />
    </div>
  );
}
