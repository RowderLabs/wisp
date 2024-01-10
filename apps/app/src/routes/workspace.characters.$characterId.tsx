import { FileRoute } from "@tanstack/react-router";
import { ImageUploadOverlay, ImageUploader, JotaiResizeHandle, JotaiTransform, JotaiTranslateHandle } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";
import { DndContext } from "@dnd-kit/core";
import { useResize, useTransform, useTranslate } from "@wisp/ui/src/hooks";
import { PropsWithChildren } from "react";
import clsx from "clsx";

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
          <JotaiTransform id={"box1"} initial={{ width: 150, height: 150, x: 300, y: 300 }}>
            <JotaiBox>
              <ImageUploader>
                {({ wrapperStyle, ...props }) => (
                  <div style={wrapperStyle} className="bg-slate-200 h-full">
                    <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
                  </div>
                )}
              </ImageUploader>
            </JotaiBox>
          </JotaiTransform>
          <JotaiTransform id={"box2"} initial={{ width: 150, height: 150, x: 300, y: 300 }}>
            <JotaiBox>
              <ImageUploader>
                {({ wrapperStyle, ...props }) => (
                  <div style={wrapperStyle} className="bg-slate-200 h-full">
                    <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
                  </div>
                )}
              </ImageUploader>
            </JotaiBox>
          </JotaiTransform>
          <JotaiTransform id={"box3"} initial={{ width: 150, height: 150, x: 300, y: 300 }}>
            <JotaiBox>
              <ImageUploader>
                {({ wrapperStyle, ...props }) => (
                  <div style={wrapperStyle} className="bg-slate-200 h-full">
                    <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
                  </div>
                )}
              </ImageUploader>
            </JotaiBox>
          </JotaiTransform>
        </DndContext>
      </div>
    </div>
  );
}

function JotaiBox({ children }: PropsWithChildren) {
  const { transformStyles, transforming } = useTransform();
  const { handle, dragStyles } = useTranslate();

  const {resizing} = useResize({
    constraints: {
      width: {
        min: 150,
        max: 800,
      },
      height: {
        min: 150,
        max: 800,
      },
    },
  });

  return (
    <div style={{ ...dragStyles, ...transformStyles }} className={clsx("absolute rounded-md ", resizing && 'outline outline-blue-300', transforming && 'z-[1000] shadow-md')}>
      {children}
      <JotaiTranslateHandle {...handle} />
      <JotaiResizeHandle position="top-right" />
      <JotaiResizeHandle position="bottom-right" />
      <JotaiResizeHandle position="bottom-left" />
      <JotaiResizeHandle position="top-left" />
    </div>
  );
}
