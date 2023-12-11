type AttributePanelProps = {
  title?: string;
  attributes: Attribute[];
};

//TODO: Update model to include different input types
type Attribute = {
  name: string;
  value: string;
};

export function AttributePanel({
  children,
  title,
  attributes,
}: AttributePanelProps & { children: (attributes: Attribute) => React.ReactNode }) {
  return (
    <div>
      {title && <p className="font-semibold text-slate-700 mb-2">{title}</p>}
      <div className="flex flex-col gap-2">{attributes.map((attr) => children(attr))}</div>
    </div>
  );
}