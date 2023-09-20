import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useBinder } from "./useBinder";
import { rspc } from "../rspc/router";
import { BinderCharacterPath } from "../rspc/bindings";

type BinderNodeProps = {
  id: number;
  name: string;
  isCollection: boolean;
  path: string;
  getChildren?: (
    pathToChildren: string
  ) => { path: string; id: number; name: string; isCollection: boolean }[];
  icon?: JSX.Element;
};

const ROOT_PATH = "/characters";

export default function Binder() {
  const { characters } = useBinder();

  return (
    <div>
      {characters && (
        <ul>
          {characters[ROOT_PATH].map((c) => (
            <BinderNode
              key={Math.random() * 4}
              {...c}
              getChildren={(pathToChildren) => characters[pathToChildren] || []}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const ExpandableBinderItem: FC<PropsWithChildren<BinderNodeProps>> = ({ children, name, path }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <li
        onClick={() => setExpanded(!expanded)}
        className="p-1 ml-2 pl-2 text-sm font-semibold text-slate-600 cursor-pointer rounded-lg hover:bg-slate-300 hover:text-white"
      >
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
  if (!props.isCollection) {
    return <BinderItem {...props} />;
  }

  const children = props.getChildren ? props.getChildren(`${props.path}/${props.id}`) : []

  return (
    <ExpandableBinderItem {...props}>
      {children &&
        children.map((item) => (
          <BinderNode key={Math.random() * 4} getChildren={props.getChildren} {...item} />
        ))}
    </ExpandableBinderItem>
  );
};
