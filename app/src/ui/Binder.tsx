import { FC } from "react";

type BinderNodeProps = {
  id: number;
  name: string;
  icon?: JSX.Element;
  items?: BinderNodeProps[];
};


type ExpandableBinderItemProps = Omit<Required<BinderNodeProps>, "icon"> & { icon?: JSX.Element };

export default function Binder() {
  return <div>Binder</div>;
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

const BinderItem = ({id, name, icon}: Omit<BinderNodeProps, 'items'>) => {
  return <div>{name}</div>;
};

const BinderNode = (props: BinderNodeProps) => {
  if (Array.isArray(props.items)) {
    <ExpandableBinderItem icon={props.icon} items={props.items} {...props}/>;
  }

  return <BinderItem {...props} />;
};
