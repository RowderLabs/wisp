import { FC } from "react";
import { useBinderContext } from "./useBinder";
import {HiUser} from 'react-icons/hi'

type BinderNodeProps = {
  id: number;
  name: string;
  icon?: JSX.Element;
  items?: BinderNodeProps[];
};

type ExpandableBinderItemProps = Omit<Required<BinderNodeProps>, "icon"> & { icon?: JSX.Element };

export default function Binder() {
  const { characters } = useBinderContext();

  return (
    <ul>
      {characters.data?.map((c) => (
        <BinderNode key={c.id} icon={<HiUser/>} {...c}></BinderNode>
      ))}
    </ul>
  );
}

const ExpandableBinderItem: FC<ExpandableBinderItemProps> = ({ items, id }) => {
  return (
    <div>
      {items.map((c) => (
        <BinderNode key={id} {...c} />
      ))}
    </div>
  );
};

const BinderItem = ({ id, name, icon }: Omit<BinderNodeProps, "items">) => {
  return (
    <li className="p-1 ml-2 pl-2 flex gap-1 items-center text-sm font-semibold text-slate-600 cursor-pointer rounded-lg hover:bg-slate-300 hover:text-white">
      {icon && <span>{icon}</span>}
      <span>{name}</span>
    </li>
  );
};

const BinderNode = (props: BinderNodeProps) => {
  if (Array.isArray(props.items)) {
    <ExpandableBinderItem icon={props.icon} items={props.items} {...props} />;
  }

  return <BinderItem {...props} />;
};
