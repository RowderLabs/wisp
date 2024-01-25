import { FileRoute } from "@tanstack/react-router";
import {
  ResizeHandle,
  TranslateHandle,
  TransformHandles,
  createPanel,
  Transform,
} from "@wisp/ui";
import { DndContext } from "@dnd-kit/core";
import { useTransform } from "@wisp/ui/src/hooks";
import { PropsWithChildren } from "react";

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
          <Transform key={"hello"} id={"hello" as string} initial={{ x: 0, y: 0, width: 150, height: 150 }}>
            <CanvasItem>{createPanel("textbox", { title: "hello" }).content}</CanvasItem>
          </Transform>
        </DndContext>
      </div>
    </div>
  );
}

function CanvasItem({ children }: PropsWithChildren) {
  const { style, translateHandle, translateRef } = useTransform();
  return (
    <div ref={translateRef} style={{ ...style }} className="absolute rounded-md">
      {children}
      <TransformHandles>
        <TranslateHandle {...translateHandle}/>
        <ResizeHandle position="top-right" />
        <ResizeHandle position="bottom-right" />
        <ResizeHandle position="bottom-left" />
        <ResizeHandle position="top-left" />
      </TransformHandles>
    </div>
  );
}
