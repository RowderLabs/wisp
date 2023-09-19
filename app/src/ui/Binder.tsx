import { FC, PropsWithChildren  } from "react";
import { useBinder } from "./useBinder";

type BinderNodeProps = {
  id: number;
  name: string;
  path: string | null;
  icon?: JSX.Element;
};

export default function Binder() {
  const { characters } = useBinder();

  return (
    <div>
      {characters && (
        <ul>
          {characters["/"] &&
            characters["/"].map((c) => (
              <BinderNode path={`${c.path ?? ""}/${c.id}`} key={c.id} name={c.name} id={c.id} />
            ))}
        </ul>
      )}
    </div>
  );
}

const ExpandableBinderItem: FC<PropsWithChildren<BinderNodeProps>> = ({ children, name, path }) => {
  return (
    <>
      <li className="p-1 ml-2 pl-2 text-sm font-semibold text-slate-600 cursor-pointer rounded-lg hover:bg-slate-300 hover:text-white">
        <div className="w-full flex items-center gap-2">
          <div className="basis-full">
            {name} {path}
          </div>
        </div>
      </li>
      <ul className="ml-5 pl-2 border-l">{children}</ul>
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
  if (characters && characters[props.path ?? ""]) {
    return (
      <ExpandableBinderItem icon={props.icon} {...props}>
        {characters[props.path as string].map((child) => (
          <BinderNode key={child.id} {...child} id={child.id} path={`${child.path}/${child.id}`} />
        ))}
      </ExpandableBinderItem>
    );
  }

  return <BinderItem {...props} />;
};
