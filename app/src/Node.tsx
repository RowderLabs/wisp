import { FC } from "react";
import { clsx } from "clsx";
import { NodeRendererProps, SimpleTreeData } from "react-arborist";

interface FileTreeNode extends SimpleTreeData {
  context?: any;
}

const Node: FC<NodeRendererProps<FileTreeNode>> = ({ node, dragHandle, style }) => {
  return (
    <div
      ref={dragHandle}
      style={style}
      className={clsx("flex items-center gap-2 hover:bg-blue-100 rounded-md h-full text-xs font-semibold", node.state)}
      onClick={() => node.isInternal && node.toggle()}
    >
      <NodeItem node={node}/>
    </div>
  );
};

const NodeItem = ({ node }: { node: NodeRendererProps<FileTreeNode>["node"] }) => {
  return (
    <>
      {node.isInternal && <span className="ml-2">{">"}</span>}
      <span className={node.isLeaf ? "ml-2" : ""}>{node.data.name}</span>
    </>
  );
};

export default Node;
