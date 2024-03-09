import { rspc } from "@wisp/client";
import { Fact } from "@wisp/client/src/bindings";

type DisplayFact<T extends "text" | "attr"> = Omit<Fact, "group_name" | "value"> & {
  value: Extract<Fact, { type: T }>["value"];
};

function TextFact({fact}: {fact: DisplayFact<'text'>}) {
  return (
    <div className="p-2 flex justify-between items-center border-b">
      <p>{fact.name}</p>
      <p>{fact.value}</p>
    </div>
  );
}

function AttrFact({fact}: {fact: DisplayFact<'attr'>}) {
  return (
    <div className="p-2 flex justify-between items-center border-b">
      <p>{fact.name}</p>
      <div className="flex gap-0.5">
        {fact.value.map((attr) => (
          <span className="rounded-md border p-1" key={fact.name}>
            {attr}
          </span>
        ))}
      </div>
    </div>
  );
}


export function FactSheet({entity_id, slice_id}: {entity_id: string, slice_id: number}) {
  const {data: slice} = rspc.useQuery(['facts.slice', {entity_id, slice_id}])
  return (
    <div className="bg-white w-full h-full rounded-md border text-sm p-8 mx-auto flex flex-col gap-2">
      <div>
        <p className="text-lg">{slice?.name}</p>
      </div>
      <div className="overflow-auto">
        {slice?.facts.map((fact) => {
          if (fact.type === "text") {
            return <TextFact key={fact.name} fact={fact} />;
          }
          if (fact.type === "attr") {
            return <AttrFact key={fact.name} fact={fact}/>;
          }
        })}
      </div>
    </div>
  );
}
