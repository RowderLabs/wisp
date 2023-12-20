import { FileRoute } from "@tanstack/react-router";
import { PanelCanvas } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: async ({ params: { characterId } }) => characterId,
  component: WorkspaceCharacterSheetPage,
});

function WorkspaceCharacterSheetPage() {
  const characterId = Route.useLoaderData();
  return (
    <div className="flex w-full px-4">
      <div className="basis-full" style={{ height: "800px" }}>
        <PanelCanvas />
      </div>
      <CharacterSummary name={characterId} />
    </div>
  );
}
