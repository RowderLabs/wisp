import { FactGroup } from "@wisp/client/src/bindings";
import { Input } from "@wisp/ui";

export function FactGroupForm({ group }: { group: FactGroup }) {
  return (
    <div className="p-4 bg-white border flex flex-col gap-2">
      {group.facts.map((fact) => {
        if (fact.type === "text") {
          return (
            <div key={fact.key} className="flex items-center gap-4 text-sm">
              <p>{fact.key}</p>
              <Input/>
            </div>
          )
        }
        if (fact.type === "attr") {
          return (
            <div key={fact.key} className="flex items-center gap-4 text-sm">
              <p>{fact.key}</p>
              <Input id={""} name={""} placeholder={fact.options.join(' ')}/>
            </div>
          )
        }
      })}
    </div>
  );
}

