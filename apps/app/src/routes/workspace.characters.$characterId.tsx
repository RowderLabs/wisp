import { FileRoute } from "@tanstack/react-router";
import { Transform, useTransform } from "@wisp/ui";
import { CharacterSummary } from "../ui/CharacterSummary";

export const Route = new FileRoute("/workspace/characters/$characterId").createRoute({
  loader: ({ context, params }) =>
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
        <Transform.Root initial={{ width: 150, height: 300 }}>
          <Transform.Resize>
            <Box />
          </Transform.Resize>
        </Transform.Root>
      </div>
      {character && <CharacterSummary name={character?.fullName} />}
    </div>
  );
}

function Box() {
  const transformStyles = useTransform();
  return (
    <div style={{ ...transformStyles }} className="bg-blue-200 border-blue-400 relative">
      <Transform.ResizeHandle />
    </div>
  );
}
