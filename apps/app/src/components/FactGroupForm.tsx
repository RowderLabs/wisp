import { FactGroup } from "@wisp/client/src/bindings";
import { Combobox, Input } from "@wisp/ui";

export function FactGroupForm({ group }: { group: FactGroup }) {
  return (
    <div className="p-8 bg-white rounded-md border grid grid-cols-2 items-center gap-4 text-sm max-w-[600px]">
      {group.facts.map((fact) => {
        if (fact.type === "text") {
          return (
            <>
              <p>{fact.key}</p>
              <Input />
            </>
          );
        }
        if (fact.type === "attr") {
          return (
            <>
              <p>{fact.key}</p>
              <Combobox.Root options={fact.options}>
                <Combobox.Query/>
                <Combobox.Options/>
              </Combobox.Root>
            </>
          );
        }
      })}
    </div>
  );
}

