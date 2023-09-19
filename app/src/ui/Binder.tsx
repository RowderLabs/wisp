import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useBinder } from "./useBinder";

type BinderNodeProps = {
  id: number;
  name: string;
  type: "item" | "collection";
  path: string;
  icon?: JSX.Element;
};

const ROOT_PATH = "/ROOT"

export default function Binder() {
  const { characters } = useBinder();

  return (
    <div>
      {characters && (
        <ul>
          {characters.items[ROOT_PATH] &&
            characters.items[ROOT_PATH].map((c) => (
              <BinderNode
                type={c.type}
                path={c.path}
                key={Math.random() * 4}
                name={c.data.name}
                id={c.data.id}
              />
            ))}
        </ul>
      )}
    </div>
  );
}

const ExpandableBinderItem: FC<PropsWithChildren<BinderNodeProps>> = ({ children, name, path }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <li onClick={() => setExpanded(!expanded)} className="p-1 ml-2 pl-2 text-sm font-semibold text-slate-600 cursor-pointer rounded-lg hover:bg-slate-300 hover:text-white">
        <div className="w-full flex items-center gap-2">
          <div className="basis-full">
            {name} {path}
          </div>
        </div>
      </li>
      {expanded && <ul className="ml-5 pl-2 border-l">{children}</ul>}
    </>
  );
};

const BinderItem = ({ path, name, icon }: Omit<BinderNodeProps, "items">) => {
  return (
    <li className="p-1 ml-2 pl-2 flex gap-1 items-center text-sm font-semibold text-slate-600 cursor-pointer rounded-lg hover:bg-slate-300 hover:text-white">
      {icon && <span>{icon}</span>}
      <span>
        {name} {path}
      </span>
    </li>
  );
};

const BinderNode = (props: BinderNodeProps) => {
  const { characters } = useBinder();

  if (props.type === "item") {
    <BinderItem {...props} />;
  }

  const items = characters?.items[`${props.path}/${props.id}`]
    ? characters?.items[`${props.path}/${props.id}`]
    : [];

  return (
    <ExpandableBinderItem {...props}>
      {items.map((item) => (
        <BinderNode
          type={item.type}
          path={item.path}
          key={Math.random() * 4}
          name={item.data.name}
          id={item.data.id}
        />
      ))}
    </ExpandableBinderItem>
  );
};
