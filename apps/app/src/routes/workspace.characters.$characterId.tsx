import { FileRoute } from "@tanstack/react-router";
import { DraggableCanvas } from "@wisp/ui";
import { Banner } from "@wisp/ui";
import { rspc } from "@wisp/client";
import { useDebouncedPanelTransform } from "../hooks/useDebouncedPanelTransform";
import { useDialogManager } from "@wisp/ui/src/hooks";
import { ImageUploadDialog } from "../components/ImageUploadDialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: ({ context }) =>
    context.rspc.queryClient.ensureQueryData({
      queryKey: ["panels.find"],
      queryFn: () => context.rspc.client.query(["panels.find"]),
    }),
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  const panels = Route.useLoaderData();
  const { transformPanel } = useDebouncedPanelTransform({ duration: 1000 });
  const { data: canvasItems } = rspc.useQuery(["panels.find"], {
    placeholderData: panels,
    staleTime: Infinity,
  });
  const [dialogManager] = useDialogManager();

  const queryClient = rspc.useContext().queryClient;
  const { mutate: createImagePanel } = rspc.useMutation(["panels.create"], {
    onSuccess: () => {
      queryClient.invalidateQueries(["panels.find"]);
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
      panel_type: 'image'
    });
  };

  //TODO: move into custom hook and apply optimistic updates.

  return (
    <div className="w-full flex flex-col" style={{ height: "100vh", overflowY: "auto" }}>
      <Banner className="bg-slate-300"></Banner>
      <div className="basis-full relative" style={{ flexBasis: "100%" }}>
        {canvasItems && (
          <DraggableCanvas
            createImage={() =>
              dialogManager.createDialog(ImageUploadDialog, { id: "create-image-panel", onUpload })
            }
            items={canvasItems}
            onItemTransform={transformPanel}
          />
        )}
      </div>
    </div>
  );
}
