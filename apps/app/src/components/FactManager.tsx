import * as Tabs from "@radix-ui/react-tabs";
import { rspc } from "@wisp/client";
import { EntityType } from "@wisp/client/src/bindings";
import { FactForm } from "./FactForm";

interface FactManagerProps {
  entityId: string;
  entityType: EntityType;
}

export function FactManager({ entityId, entityType }: FactManagerProps) {
  const { data: factGroups, isLoading, isError } = rspc.useQuery(["facts.groups", entityType]);

  if (isLoading || isError) {
    return null
  }

  return (
    <Tabs.Root className="flex flex-col p-4 gap-4" defaultValue={factGroups[0].name}>
      <Tabs.List className="flex border-b">
        {factGroups?.map((group) => (
          <Tabs.Trigger className="px-4 py-2 rounded-md text-left hover:bg-slate-200" value={group.name} key={group.id}>
            {group.name}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {factGroups?.map((group) => (
        <Tabs.Content value={group.name} key={group.id}>
          <FactGroup entityId={entityId} entityType={entityType} groupId={group.id} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

function FactGroup(props: { entityId: string; entityType: EntityType; groupId: number }) {
  const { data: facts, isLoading, isError } = rspc.useQuery(["facts.on_entity", props]);

  if (isLoading || isError) {
    return null;
  }

  return <FactForm facts={facts} {...props} />;
}
