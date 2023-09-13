import { FC } from "react";
import { Tree, NodeRendererProps, SimpleTreeData } from "react-arborist";

type BinderProps<T extends SimpleTreeData> = {
  data: T[];
  children: FC<NodeRendererProps<T>>;
};

export default function Binder<T extends SimpleTreeData>({ data, children }: BinderProps<T>) {
  return (
    <div className="flex justify-center">
      <Tree width={290} data={data} rowHeight={28} padding={20}>
        {children}
      </Tree>
    </div>
  );
}
