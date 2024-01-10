import { FileRoute } from "@tanstack/react-router";
import { JotaiTransform } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";
import { DndContext, UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import { useResize } from "@wisp/ui/src/hooks";

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
          <JotaiTransform initial={{ width: 150, height: 150, x: 300, y: 300}}>
            <JotaiBox />
          </JotaiTransform>
        </DndContext>
      </div>
      {character && <CharacterSummary name={character?.fullName} />}
    </div>
  );
}

function JotaiBox() {
  const { transform } = useResize();

  return (
    <div
      style={{ left: transform.x, top: transform.y, ...transform }}
      className="relative rounded-md bg-slate-300"
    >
      <JotaiResizeHandle id={'top-left'} position="top-right"/>
    </div>
  );
}

function JotaiResizeHandle({ position, id }: {position: string, id: UniqueIdentifier}) {
  
  const { listeners, attributes, setNodeRef } = useDraggable({
    id,
    data: {
      transform: {
        type: "resize",
        handlePosition: position,
      },
    },
  });
  return <div {...listeners} {...attributes} ref={setNodeRef} className="absolute -right-2 -top-2 rounded-full bg-blue-300 w-6 h-6"></div>;
}

