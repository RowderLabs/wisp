import { FileRoute } from "@tanstack/react-router";
import { DraggableCanvas } from "@wisp/ui";
import { Banner } from "../ui/Banner";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: ({ context, params }) =>
    context.rspc.queryClient.ensureQueryData({
      queryKey: ["characters.with_id", { id: params.characterId }],
      queryFn: () => context.rspc.client.query(["characters.with_id", params.characterId]),
    }),
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  return (
    <div className="w-full" style={{ height: '100vh', overflowY: "auto", }}>
      <Banner className="bg-slate-300"></Banner>
      <div className="basis-full relative">
        <DraggableCanvas />
      </div>
    </div>
  );
}
