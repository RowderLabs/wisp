import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { NotFound } from "../components/NotFound";
import { Banner, Toolbar, DraggableCanvas, TextboxPanel, ImagePanel } from "@wisp/ui";
import { PropsWithChildren } from "react";
import { HiTable } from "react-icons/hi";
import { HiMiniDocumentText, HiPhoto, HiRectangleStack } from "react-icons/hi2";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { FactSlicePanel } from "../panels/factslice";
import { rspc, useUtils } from "@wisp/client";
import { useDialogManager, useDraggableCanvas } from "@wisp/ui/src/hooks";
import { useCreatePanel } from "../hooks/useCreatePanel";
import { useDeletePanel } from "../hooks/useDeletePanel";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { ImageUploadDialog } from "../components/ImageUploadDialog";
import { Panel } from "@wisp/client/src/bindings";
import { z } from "zod";
import { useDebouncedTransform } from "../hooks/useDebouncedTransform";

export const EntityTypeSchema = z.object({ type: z.enum(["character", "location"]) });

export const Route = createFileRoute("/workspace/entity/$entityId/")({
  staticData: {
    routeBreadcrumb: "character-page",
  },
  validateSearch: EntityTypeSchema,
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
  //data from route
  const canvasPreload = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const params = Route.useParams();
  const utils = useUtils()

  const [debouncedTransform] = useDebouncedTransform({entityId: params.entityId})


  //canvas
  const [canvas, handlers] = useDraggableCanvas({
    preloaded: canvasPreload,
    entityId: params.entityId,
    onItemTransform: debouncedTransform,
    onItemDelete: (id) => {
      dialogManager.createDialog(ConfirmationDialog, {
        id: `confirm-delete-${id}`,
        message: `Are you sure you want to delete this panel?`,
        onConfirm: () => deletePanel(id),
      });
    },
  });

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

  //fact manager
  const navigate = useNavigate();

  const openFactManager = () => {
    navigate({ to: "/workspace/entity/$entityId/facts", params, search: searchParams });

    /*dialogManager.createDialog(FactManagerDialog, {
      id: "fact-manager",
      context: { entityId: params.entityId, entityType: searchParams.type },
    });*/
  };
  
  return (
    <div className="w-full flex flex-col" style={{ height: "100vh", overflowY: "auto" }}>
      <Banner className="bg-slate-300 relative"></Banner>
      <Breadcrumbs />
      <div className="basis-full relative" style={{ flexBasis: "100%" }}>
        <DraggableCanvasToolbar>
          <Toolbar.IconButton onClick={createTextboxPanel} icon={<HiMiniDocumentText />} />
          <Toolbar.IconButton onClick={createImagePanel} icon={<HiPhoto />} />
          <Toolbar.IconButton onClick={createFactSlicePanel} icon={<HiTable />} />
          <Toolbar.IconButton onClick={openFactManager} icon={<HiRectangleStack />} />
          {/*<Toolbar.ToggleGroup asChild type="single">
            <Toolbar.ToggleItem onClick={toggleGridSnap} value="grid-snap" icon={<HiOutlineViewGrid />} />
          </Toolbar.ToggleGroup>
         */}
        </DraggableCanvasToolbar>

        {canvas && (
          <DraggableCanvas<Panel>
            {...handlers}
            {...canvas}
            renderItem={(item) => {
              if (item.panelType === "textbox") {
                return new TextboxPanel()
                  .getClientProps({
                    editable: canvas.selected === item.id,
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

