import { FileRoute } from "@tanstack/react-router";
import { DraggableCanvas } from "@wisp/ui";
import { Banner } from "../ui/Banner";
import { rspc } from "../rspc/router";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: ({ context, params }) =>
    context.rspc.queryClient.ensureQueryData({
      queryKey: ["characters.with_id", { id: params.characterId }],
      queryFn: () => context.rspc.client.query(["characters.with_id", params.characterId]),
    }),
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  const { data: items } = rspc.useQuery(["panels.find"]);
  const queryClient = rspc.useContext().queryClient
  const { mutate: updateTransform } = rspc.useMutation(["panels.transform"], {onSuccess: () => {
    queryClient.invalidateQueries(['panels.find'])
  }});
  return (
    <div className="w-full" style={{ height: "100vh", overflowY: "auto" }}>
      <Banner className="bg-slate-300"></Banner>
      <div className="basis-full relative">
        {items && (
          <DraggableCanvas
            onItemTransform={(item) => updateTransform({ id: item.id, transform: { ...item } })}
            items={items}
          />
        )}
        {JSON.stringify(items)}
      </div>
    </div>
  );
}
