import { createFileRoute, notFound } from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";
import { Banner, Toolbar, DraggableCanvas, TextboxPanel, ImagePanel, TransformEvent } from "@wisp/ui";
import { PropsWithChildren } from "react";
import { HiTable } from "react-icons/hi";
import { HiMiniDocumentText, HiPhoto } from "react-icons/hi2";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { FactSlicePanel } from "../panels/factslice";
import { rspc, useUtils } from "@wisp/client";
import { useDebouncedDraft, useDialogManager } from "@wisp/ui/src/hooks";
import { useCreatePanel } from "../hooks/useCreatePanel";
import { useDeletePanel } from "../hooks/useDeletePanel";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { ImageUploadDialog } from "../components/ImageUploadDialog";
import { Panel } from "@wisp/client/src/bindings";
import React from "react";

export const Route = createFileRoute("/workspace/entity/$entityId")({
  staticData: {
    routeBreadcrumb: "character-page",
  },
  loader: async ({ context, params }) => {
    const canvas = await context.rspc.client.query(["canvas.for_entity", params.entityId]);
    if (!canvas) throw notFound();
    return canvas;
  },
  notFoundComponent: () => <NotFound />,
  component: EntityPage,
});

function EntityPage() {
  //utils
  const utils = useUtils();

  //data from route
  const canvasPreload = Route.useLoaderData();
  const params = Route.useParams();

  //canvas
  const { data: canvas } = rspc.useQuery(["canvas.for_entity", params.entityId], {
    placeholderData: canvasPreload,
  });

  const { mutate: commitTransform } = rspc.useMutation("panels.transform", {
    onError: (e) => {
      console.error(e);
    },
  });

  const [draft, setDraft] = useDebouncedDraft<TransformEvent>({
    duration: 500,
    callback: commitTransform,
  });

  React.useLayoutEffect(() => {
    if (!draft) return;
    const cachedQueryData = utils.getQueryData(["canvas.for_entity", params.entityId]);
    const cachedPanel = cachedQueryData?.panels.find((panel) => panel.id === draft?.id);
    const cachedPanels = cachedQueryData?.panels.filter((panel) => panel.id !== draft?.id);

    if (cachedQueryData && cachedPanel && cachedPanels) {
      utils.setQueryData(["canvas.for_entity", params.entityId], {
        ...cachedQueryData,
        panels: [...cachedPanels, { ...cachedPanel, ...draft }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  //dialog stuff
  const [dialogManager] = useDialogManager();

  //panels
  const createPanelWithType = useCreatePanel(canvas!.id);
  const { deletePanel } = useDeletePanel();
  const { mutate: setPanelContent } = rspc.useMutation(["panels.set_content"], {
    onSuccess: () => {
      utils.invalidateQueries(["canvas.for_entity", params.entityId]);
    },
  });

  //panel creation
  const createImagePanel = () =>
    dialogManager.createDialog(ImageUploadDialog, {
      id: "create-image-panel",
      onUpload: (path: string) => {
        const imageSrc = convertFileSrc(path);
        createPanelWithType("image", { content: JSON.stringify({ src: imageSrc }) });
      },
    });

  const createTextboxPanel = () => createPanelWithType("textbox", { content: null });

  const createFactSlicePanel = () =>
    createPanelWithType("factsheet", {
      content: JSON.stringify({ entity_id: params.entityId, slice_id: 1 }),
    });

  return (
    <div className="w-full flex flex-col" style={{ height: "100vh", overflowY: "auto" }}>
      <Banner className="bg-slate-300 relative"></Banner>
      <Breadcrumbs />
      <div className="basis-full relative" style={{ flexBasis: "100%" }}>
        <DraggableCanvasToolbar>
          <Toolbar.IconButton onClick={createTextboxPanel} icon={<HiMiniDocumentText />} />
          <Toolbar.IconButton onClick={createImagePanel} icon={<HiPhoto />} />
          <Toolbar.IconButton onClick={createFactSlicePanel} icon={<HiTable />} />
          {/*<Toolbar.ToggleGroup asChild type="single">
            <Toolbar.ToggleItem onClick={toggleGridSnap} value="grid-snap" icon={<HiOutlineViewGrid />} />
          </Toolbar.ToggleGroup>
         */}
        </DraggableCanvasToolbar>

        {canvas && (
          <DraggableCanvas<Panel>
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
                return new ImagePanel().getClientProps({ fit: "cover" }).getServerProps(item.content).render();
              }

              if (item.panelType === "factsheet") {
                return new FactSlicePanel().getClientProps({}).getServerProps(item.content).render();
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
