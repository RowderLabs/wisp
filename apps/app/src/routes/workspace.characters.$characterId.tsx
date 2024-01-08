import { FileRoute } from "@tanstack/react-router";
import { Transform, useResizable, useTransform, useTranslate } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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
        <Transform.Root onTranformEnd={(e) => console.log(e.x)} initial={{ width: 150, height: 300 }}>
          <Box />
        </Transform.Root>
      </div>
      {character && <CharacterSummary name={character?.fullName} />}
    </div>
  );
}

function Box() {
  const { status, transformRef, x, y, ...transformStyles } = useTransform();
  const { isResizing } = useResizable();
  useTranslate();

  const { listeners, attributes, transform } = useDraggable({
    id: 2,
    data: {
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
      ref={transformRef}
      style={{ ...style, ...transformStyles, left: x, top: y, outline: isResizing ? "2px solid blue" : "" }}
      className="bg-blue-200 border-blue-400 absolute"
    >
      <div className="bg-slate-300 h-10" {...listeners}></div>
      <Transform.ResizeHandle position="top-left" />
    </div>
  );
}
