import { createFileRoute } from "@tanstack/react-router";
import { DraggableCanvas, Toolbar, TransformEvent } from "@wisp/ui";
import { Banner } from "@wisp/ui";
import { rspc, useUtils } from "@wisp/client";
import { useDebouncedDraft, useDialogManager } from "@wisp/ui/src/hooks";
import { ImageUploadDialog } from "../components/ImageUploadDialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Procedures } from "@wisp/client/src/bindings";
import React, { PropsWithChildren } from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { HiMiniDocumentText, HiPhoto } from "react-icons/hi2";
import { HiOutlineViewGrid, HiTable } from "react-icons/hi";
import { Modifier } from "@dnd-kit/core";

export const Route = createFileRoute("/workspace/characters/$characterId")({
  loader: ({ context, params }) =>
    context.rspc.utils.ensureQueryData(["characters.canvas", params.characterId]),
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
  const [draft, setDraft] = useDebouncedDraft<TransformEvent>({
    duration: 500,
    callback: commitTransform,
  });
  const queryClient = rspc.useContext().queryClient;

  React.useEffect(() => {
    if (!draft) return;
    type CharacterCanvas = Extract<Procedures["queries"], { key: "characters.canvas" }>["result"];
    const cachedQueryData = queryClient.getQueryData<CharacterCanvas>([
      "characters.canvas",
      params.characterId,
    ]);
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
  const utils = useUtils();

  const { mutate: createImagePanel } = rspc.useMutation(["panels.create"], {
    onSuccess: () => {
      utils.invalidateQueries(["characters.canvas"]);
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

  const createImage = () =>
    dialogManager.createDialog(ImageUploadDialog, { id: "create-image-panel", onUpload });

  const { mutate: createTextboxDb } = rspc.useMutation(["panels.create"], {
    onSuccess: () => {
      utils.invalidateQueries(["characters.canvas"]);
    },
  });

  const createTextbox = () => {
    createTextboxDb({
      x: Math.floor(Math.random() * (400 - 150 + 1)) + 150,
      y: Math.floor(Math.random() * (400 - 150 + 1)) + 150,
      width: 150,
      height: 200,
      content: null,
      panel_type: "textbox",
      canvas_id: canvas!.id,
    });
  };

  //TODO: move into custom hook and apply optimistic updates.
  const { mutate: deletePanel } = rspc.useMutation("panels.delete", {
    onSuccess: () => {
      utils.invalidateQueries(["characters.canvas"]);
    },
  });
  const snapToGrid: Modifier = (args) => {
    const { transform } = args;
    return {
      ...transform,
      x: Math.ceil(transform.x / 10) * 10,
      y: Math.ceil(transform.y / 10) * 10,
    };
  };

  const [canvasModifiers, setCanvasModifiers] = React.useState<Modifier[]>([]);
  const gridSnapActive = React.useRef<boolean>(false);

  const toggleGridSnap = () => {
    //TODO: actually filter modifiers
    if (gridSnapActive.current === true) {
      setCanvasModifiers([]);
    } else {
      setCanvasModifiers([...canvasModifiers, snapToGrid]);
    }
    gridSnapActive.current = !gridSnapActive.current;
  };

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
            modifiers={canvasModifiers}
            onItemDelete={(id) => {
              dialogManager.createDialog(ConfirmationDialog, {
                id: `confirm-delete-${id}`,
                message: `Are you sure you want to delete this panel?`,
                onConfirm: () => deletePanel(id),
              });
            }}
            id={canvas.id}
            items={canvas.panels}
            onItemTransform={setDraft}
          >
            <DraggableCanvasToolbar>
              <Toolbar.IconButton onClick={createTextbox} icon={<HiMiniDocumentText />} />
              <Toolbar.IconButton onClick={createImage} icon={<HiPhoto />} />
              <Toolbar.IconButton disabled={true} icon={<HiTable />} />
              <Toolbar.ToggleGroup asChild type="single">
                <Toolbar.ToggleItem
                  onClick={toggleGridSnap}
                  value="grid-snap"
                  icon={<HiOutlineViewGrid />}
                />
              </Toolbar.ToggleGroup>
            </DraggableCanvasToolbar>
          </DraggableCanvas>
        )}
      </div>
    </div>
  );
}

function DraggableCanvasToolbar({ children }: PropsWithChildren) {
  return (
    <div className="absolute top-0 left-2">
      <Toolbar.Root orientation="vertical">{children}</Toolbar.Root>
    </div>
  );
}
