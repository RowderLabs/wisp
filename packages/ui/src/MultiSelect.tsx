import { PropsWithChildren } from "react";
import { Input } from "./Input";

function Root({ children }: PropsWithChildren) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

interface MultiSelectSelectionProps {
  selected: string[];
}

function Label({children}: PropsWithChildren) {
    return children
}

function Selection({ selected }: MultiSelectSelectionProps) {
  return (
    <ul>
      {selected.map((s) => (
        <li className="p-0.5 inline-block rounded-md border" key={s}>
          {s}
        </li>
      ))}
    </ul>
  );
}

function Content({children}: PropsWithChildren) {
    return (<div className="relative w-full">
        {children}
    </div>)
}

interface MultiSelectQueryProps {
  className?: string;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
function Query({ className, onBlur, onFocus, onChange }: MultiSelectQueryProps) {
  return <Input className={className} onFocus={onFocus} onBlur={onBlur} onChange={onChange} />;
}

interface MultiSelectOptionsProps {
  options: string[];
  handleSelect: (option: string) => void;
}

function Options({ options, handleSelect }: MultiSelectOptionsProps) {
  return (
    <ul className="absolute shadow-sm top-12 w-full bg-white p-2 flex gap-1 flex-col">
      {options.map((opt) => (
        <li onMouseDown={() => handleSelect(opt)} key={opt} className="p-2">
          {opt}
        </li>
      ))}
    </ul>
  );
}

export const MultiSelect = { Root, Selection, Query, Options, Content, Label };
