import { FileRoute } from "@tanstack/react-router";
import {
  DraggableCanvas,
} from "@wisp/ui";

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
    <div className="flex w-full">
      <div className="basis-full relative" style={{height: 800, overflowY: 'auto'}}>
        <DraggableCanvas/>
      </div>
    </div>
  );
}


