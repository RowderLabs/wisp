import { FileRoute } from "@tanstack/react-router";
import { JotaiTransform, Transform, useResizable, useTransform, useTranslate } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";
import { DndContext, UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";
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
      <JotaiResizeHandle id={'top-left'} position="top-left"/>
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
  return <div {...listeners} {...attributes} ref={setNodeRef} className="absolute -inset-2 rounded-full bg-blue-300 w-6 h-6"></div>;
}

function Box() {
  const { transformRef, transformStyles } = useTransform();
  const { isResizing, handlePosition } = useResizable({
    minWidth: 150,
    maxWidth: 600,
    minHeight: 150,
    maxHeight: 600,
  });
  useTranslate();

  const { listeners, attributes, transform, setNodeRef } = useDraggable({
    id: 2,
    data: {
      modifiers: [restrictToParentElement],
      transform: {
        type: "translate",
      },
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      {...attributes}
      ref={(elem) => {
        transformRef.current = elem;
        setNodeRef(elem);
      }}
      style={{ ...style, ...transformStyles, outline: isResizing ? "2px solid blue" : "" }}
      className="bg-blue-200 border-blue-400 absolute"
    >
      <div className="bg-slate-300 h-10" {...listeners}>
        {handlePosition}
      </div>
      <Transform.ResizeHandle id={"top-left"} position="top-left" />
      <Transform.ResizeHandle id={"top-right"} position="bottom-right" />
    </div>
  );
}
