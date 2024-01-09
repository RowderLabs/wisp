import { FileRoute } from "@tanstack/react-router";
import {
  JotaiTransform,
  Transform,
  useBunshiResizable,
  useBunshiTranslate,
  useResizable,
  useTransform,
  useTranslate,
} from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";

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
        <JotaiTransform initial={{width: 50, height: 50, x: 50, y: 50}}>
          <JotaiBox />
        </JotaiTransform>
      </div>
      {character && <CharacterSummary name={character?.fullName} />}
    </div>
  );
}

function JotaiBox() {

  const [{ x, y }, translate] = useBunshiTranslate();

  return (
    <div>
      <p>
        {x} {y}
      </p>
      <button onClick={() => translate({ x: x! + 50, y: y! - 20 })}>Translate</button>
    </div>
  );
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
