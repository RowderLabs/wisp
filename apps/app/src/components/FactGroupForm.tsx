import { FactGroup } from "@wisp/client/src/bindings";
import { Input, MultiSelect } from "@wisp/ui";
import { useMemo, useState } from "react";

export function FactGroupForm({ group }: { group: FactGroup }) {
  return (
    <div className="p-8 bg-white rounded-md border grid grid-cols-2 items-center gap-4 max-w-[600px]">
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
              <AttrFactField key={fact.key} factKey={fact.key} options={fact.options} />
            </>
          );
        }
      })}
    </div>
  );
}

function AttrFactField({ factKey, options }: { factKey: string; options: string[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [opts, setOpts] = useState(options);
  const [hasFocus, setHasFocus] = useState(false);
  const filteredOpts = useMemo(
    () => opts.filter((opt) => opt.toLowerCase().includes(query.toLowerCase())),
    [query, opts]
  );
  const showOptions = useMemo(() => opts.length && hasFocus, [opts, hasFocus]);

  const handleSelect = (opt: string) => {
    const selectedOpt = selected.find((o) => opt === o);
    if (selectedOpt) {
      setSelected(selected.filter((s) => s !== opt));
    } else {
      setSelected([...selected, opt]);
    }
  };

  return (
    <MultiSelect.Root>
      <MultiSelect.Selection selected={selected} />
      <MultiSelect.Content>
          <MultiSelect.Query
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setHasFocus(false)}
            onFocus={() => setHasFocus(true)}
          />
        {showOptions && <MultiSelect.Options handleSelect={handleSelect} options={filteredOpts} />}
      </MultiSelect.Content>
    </MultiSelect.Root>
  );
}
