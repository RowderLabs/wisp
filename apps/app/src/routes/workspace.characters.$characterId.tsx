import { createFileRoute, notFound } from "@tanstack/react-router";
import { DraggableCanvas, ImagePanel, TextboxPanel, Toolbar, TransformEvent } from "@wisp/ui";
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
import { Panel } from "@wisp/client/src/bindings";
import { FactSlicePanel } from "../panels/factslice";
import { FactForm } from "../components/FactForm";

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
  const { data: factGroups } = rspc.useQuery(["facts.list", params.characterId]);

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

  const { mutate: setPanelContent } = rspc.useMutation(["panels.set_content"], {
    onSuccess: () => {
      queryClient.invalidateQueries(["characters.canvas"]);
    },
  });

  return (
    <div className="w-full flex flex-col" style={{ height: "100vh", overflowY: "auto" }}>
      <Banner className="bg-slate-300 relative">
        <DraggableCanvasToolbar>
          <Toolbar.IconButton
            onClick={() => createPanelWithType("textbox", { content: null })}
            icon={<HiMiniDocumentText />}
          />
          <Toolbar.IconButton onClick={createImage} icon={<HiPhoto />} />
          <Toolbar.IconButton
            onClick={() =>
              createPanelWithType("factsheet", {
                content: JSON.stringify({
                  facts: [
                    { name: "First Name", value: "Matt", type: "text", group_name: 'characters' },
                    { name: "Personality", options: ['kind', 'caring', 'old'], value: ["kind", "caring"], type: "attr", group_name: 'characters' },
                  ],
                }),
              })
            }
            icon={<HiTable />}
          />
          <Toolbar.ToggleGroup asChild type="single">
            <Toolbar.ToggleItem
              onClick={toggleGridSnap}
              value="grid-snap"
              icon={<HiOutlineViewGrid />}
            />
          </Toolbar.ToggleGroup>
        </DraggableCanvasToolbar>
      </Banner>
      {factGroups && <FactForm entityId={params.characterId} facts={factGroups} />}
      <Breadcrumbs />
      <div className="basis-full relative" style={{ flexBasis: "100%" }}>
        {canvas && (
          <DraggableCanvas<Panel>
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
            renderItem={(item) => {
              if (item.panelType === "textbox") {
                return new TextboxPanel()
                  .getClientProps({
                    editable: true,
                    pluginOpts: { onChange: { debounce: { duration: 500 } } },
                    onChange: (editorState) => {
                      setPanelContent({
                        id: item.id,
                        content: JSON.stringify({ initial: editorState.toJSON() }),
                      });
                    },
                  })
                  .getServerProps(item.content)
                  .render();
              }

              if (item.panelType === "image") {
                return new ImagePanel()
                  .getClientProps({ fit: "cover" })
                  .getServerProps(item.content)
                  .render();
              }

              if (item.panelType === "factsheet") {
                return new FactSlicePanel()
                  .getClientProps({})
                  .getServerProps(item.content)
                  .render();
              }

              return null;
            }}
            onItemTransform={setDraft}
          ></DraggableCanvas>
        )}
      </div>
    </div>
  );
}

function DraggableCanvasToolbar({ children }: PropsWithChildren) {
  return (
    <div className="absolute top-8 left-4">
      <Toolbar.Root orientation="horizontal">{children}</Toolbar.Root>
    </div>
  );
}
