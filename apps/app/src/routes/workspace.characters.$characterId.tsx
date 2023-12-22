import { FileRoute } from "@tanstack/react-router";
import { PanelCanvas } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: ({context, params}) =>
    context.rspc.queryClient.ensureQueryData({
      queryKey: ["characters.with_id", { id: params.characterId }],
      queryFn: () => context.rspc.client.query(["characters.with_id", params.characterId]),
    }),
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  const character = Route.useLoaderData();
  return (
    <div className="flex w-full px-4">
      <div className="basis-full" style={{ height: "800px" }}>
        <PanelCanvas />
      </div>
      {character && <CharacterSummary name={character?.fullName} />}
    </div>
  );
}
