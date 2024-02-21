import { ScopeProvider, createScope, molecule, useMolecule } from "bunshi/react";
import { Input } from "./Input";
import invariant from "tiny-invariant";
import { PropsWithChildren, useMemo, useState } from "react";
import clsx from "clsx";

interface ComboboxContext {
  query: string;
  setQuery: (query: string) => void;
  hasFocus: boolean;
  setHasFocus: (old: boolean) => void;
  selected: string[];
  options: string[];
  onSelect: (item: string) => void;
}

const ComboboxScope = createScope<ComboboxContext | undefined>(undefined);
const ComboboxMolecule = molecule((_, scope) => {
  const props = scope(ComboboxScope);
  invariant(props, "No Combobox Context Provided");

  return props;
});

function Root({ options, children }: PropsWithChildren<Pick<ComboboxContext, "options">>) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);

  const onSelect = (opt: string) => {
    const selectedOpt = selected.find((o) => opt === o);
    if (selectedOpt) {
      setSelected(selected.filter((s) => s !== opt));
    } else {
      setSelected([...selected, opt]);
    }
  };

  return (
    <ScopeProvider scope={ComboboxScope} value={{ options, onSelect, selected, query, hasFocus, setQuery,setHasFocus  }}>
      <div className="relative text-sm" role="combobox">
        {children}
      </div>
    </ScopeProvider>
  );
}

function Query() {
  const { setHasFocus, setQuery } = useMolecule(ComboboxMolecule);
  return (
    <Input
      onBlur={() => setHasFocus(false)}
      onFocus={() => setHasFocus(true)}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Options() {
  const { query, options, hasFocus } = useMolecule(ComboboxMolecule);
  const filteredOpts = useMemo(
    () => options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );
  const canShow = useMemo(() => Boolean(hasFocus && options.length), [options, hasFocus]);
  return (
    <>
      {canShow && (
        <ul className="absolute rounded-md shadow-sm top-12 w-full bg-white p-2 flex gap-1 flex-col">
          {filteredOpts.map((opt) => (
            <Item key={opt} item={opt} />
          ))}
        </ul>
      )}
    </>
  );
}

interface ComboboxItemProps {
  item: string;
}

function Item({ item }: PropsWithChildren<ComboboxItemProps>) {
  const { onSelect, selected } = useMolecule(ComboboxMolecule);
  return (
    <li
      onMouseDown={() => onSelect(item)}
      className={clsx(
        "p-2 rounded-md hover:bg-blue-100",
        selected.indexOf(item) !== -1 && "bg-blue-200"
      )}
    >
      {item}
    </li>
  );
}

export const Combobox = { Root, Options, Query };
