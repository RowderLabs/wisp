import { createFileRoute, notFound } from "@tanstack/react-router";
import { DraggableCanvas, Toolbar, TransformEvent } from "@wisp/ui";
import { Banner } from "@wisp/ui";
import { rspc } from "@wisp/client";
import { useDebouncedDraft, useDialogManager } from "@wisp/ui/src/hooks";
import { ImageUploadDialog } from "../components/ImageUploadDialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Procedures } from "@wisp/client/src/bindings";
import React, { PropsWithChildren } from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { HiMiniDocumentText, HiPhoto } from "react-icons/hi2";
import { HiOutlineViewGrid, HiTable } from "react-icons/hi";
import { Modifier } from "@dnd-kit/core";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { NotFound } from "../components/NotFound";
import { useCreatePanel } from "../hooks/useCreatePanel";
import { useDeletePanel } from "../hooks/useDeletePanel";

export const Route = createFileRoute("/workspace/characters/$characterId")({
  staticData: {
    routeBreadcrumb: "character-page",
  },
  loader: async ({ context, params }) => {
    const canvas = await context.rspc.client.query(["characters.canvas", params.characterId]);
    if (!canvas) throw notFound();
    return canvas;
  },
  notFoundComponent: () => <NotFound />,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const { data: canvas } = rspc.useQuery(["characters.canvas", params.characterId], {
    placeholderData: canvasPreload,
    staleTime: Infinity,
  });
  const [dialogManager] = useDialogManager();
  const createPanelWithType = useCreatePanel(canvas!.id);
  const { deletePanel } = useDeletePanel();


  const createImage = () =>
    dialogManager.createDialog(ImageUploadDialog, {
      id: "create-image-panel",
      onUpload: (path: string) => {
        const imageSrc = convertFileSrc(path);
        createPanelWithType("image", { content: JSON.stringify({ src: imageSrc }) });
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
      <Breadcrumbs />
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
              <Toolbar.IconButton
                onClick={() => createPanelWithType("textbox")}
                icon={<HiMiniDocumentText />}
              />
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
