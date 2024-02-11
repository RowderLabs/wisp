import { FileRoute } from "@tanstack/react-router";
import { DraggableCanvas, TransformEvent } from "@wisp/ui";
import { Banner } from "@wisp/ui";
import { rspc } from "@wisp/client";
import { useDebouncedDraft, useDialogManager } from "@wisp/ui/src/hooks";
import { ImageUploadDialog } from "../components/ImageUploadDialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Procedures } from "@wisp/client/src/bindings";
import React from "react";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: ({ context, params }) =>
    context.rspc.queryClient.ensureQueryData({
      queryKey: ["characters.canvas"],
      queryFn: () => context.rspc.client.query(["characters.canvas", params.characterId]),
    }),
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  const canvasPreload = Route.useLoaderData();
  const params = Route.useParams();

  const { mutate: commitTransform } = rspc.useMutation("panels.transform", {
    onError: (e) => {
      console.error(e);
    },
  });
  const [draft, setDraft] = useDebouncedDraft<TransformEvent>({ duration: 500, callback: commitTransform });
  const queryClient = rspc.useContext().queryClient;

  React.useEffect(() => {
    if (!draft) return;
    type CharacterCanvas = Extract<Procedures["queries"], { key: "characters.canvas" }>["result"];
    const cachedQueryData = queryClient.getQueryData<CharacterCanvas>(["characters.canvas", params.characterId]);
    const cachedPanel = cachedQueryData?.panels.find((panel) => panel.id === draft?.id);
    const cachedPanels = cachedQueryData?.panels.filter((panel) => panel.id !== draft?.id);

    if (cachedQueryData && cachedPanel && cachedPanels) {
      queryClient.setQueryData<CharacterCanvas>(["characters.canvas", params.characterId], {
        ...cachedQueryData,
        panels: [...cachedPanels, { ...cachedPanel, ...draft }],
      });
    }
  }, [draft]);

  const { data: canvas } = rspc.useQuery(["characters.canvas", params.characterId], {
    placeholderData: canvasPreload,
    staleTime: Infinity,
  });
  const [dialogManager] = useDialogManager();

  const { mutate: createImagePanel } = rspc.useMutation(["panels.create"], {
    onSuccess: () => {
      queryClient.invalidateQueries(["characters.canvas"]);
    },
  });

  const onUpload = (path: string) => {
    const imageSrc = convertFileSrc(path);
    createImagePanel({
      x: 300,
      y: 300,
      width: 200,
      height: 300,
      content: JSON.stringify({ src: imageSrc }),
      panel_type: "image",
      canvas_id: canvas!.id,
    });
  };

  //TODO: move into custom hook and apply optimistic updates.

  return (
    <div className="w-full flex flex-col" style={{ height: "100vh", overflowY: "auto" }}>
      <Banner className="bg-slate-300">
        <div>
          <p>canvas id: {canvas?.id}</p>
        </div>
      </Banner>
      <div className="basis-full relative" style={{ flexBasis: "100%" }}>
        {canvas && (
          <DraggableCanvas
            id={canvas.id}
            createImage={() => dialogManager.createDialog(ImageUploadDialog, { id: "create-image-panel", onUpload })}
            items={canvas.panels}
            onItemTransform={setDraft}
          />
        )}
      </div>
    </div>
  );
}
