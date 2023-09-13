import { FC } from "react";
import { clsx } from "clsx";
import { NodeRendererProps, SimpleTreeData } from "react-arborist";
import { HiChevronRight } from "react-icons/hi";

export interface BinderNode extends SimpleTreeData {
    context?: any;
    icon?: JSX.Element;
    children?: BinderNode[]
}

const Node: FC<NodeRendererProps<BinderNode>> = ({ node, dragHandle, style }) => {
  return (
    <div
      ref={dragHandle}
      style={style}
      className={clsx("flex items-center hover:bg-blue-100 rounded-md h-full text-xs font-semibold", node.state)}
      onClick={() => node.isInternal && node.toggle()}
    >
      <NodeItem node={node} />
    </div>
  );
};

const NodeItem = ({ node }: { node: NodeRendererProps<BinderNode>["node"] }) => {
  return (
    <>
      {
        <div className="ml-2 flex gap-2 items-center text-[14px]">
          <span className="w-4 flex items-center">{node.isInternal && <HiChevronRight />}</span>
          <span className="w-4 flex items-center">{node.data.icon}</span>
          <span className="flex-1 overflow-hidden ellipses">{node.data.name}</span>
        </div>
      }
    </>
  );
};

export default Node;
