import { FileRoute } from "@tanstack/react-router";
import { PanelCanvas } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";
import { rspc } from "../rspc/router";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: (opts) => opts.params.characterId,
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  const characterId = Route.useLoaderData();
  const {data: character} = rspc.useQuery(['characters.with_id', characterId])
  return (
    <div className="flex w-full px-4">
      <span>{characterId}</span>
      <div className="basis-full" style={{ height: "800px" }}>
        <PanelCanvas />
      </div>
      {character && <CharacterSummary name={character?.fullName} />}
    </div>
  );
}
