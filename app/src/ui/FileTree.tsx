
import React, { PropsWithChildren, useState } from 'react'
import { FileTreeContextProps } from '../context/FileTreeContext';

interface SimpleNode {
    id: number;
    name: string | null;
    path: string;
    isCollection: boolean;
  }

interface FileTreeNodeProps<TNodeType extends SimpleNode> {
    id: number;
    name: string | null;
    path: string;
    isCollection: boolean;
    ctx: TNodeType;
    renderItem: (ctx: TNodeType) => React.ReactNode;
    getChildren?: (pathToChildren: string) => TNodeType[];
  }


  type FileTreeProps<T> = {
    renderItem: (ctx: T) => React.ReactNode;
    useFileTree: () => FileTreeContextProps<T>
  }
  
  const ROOT_PATH = "/characters";
  
  export default function FileTree<T extends SimpleNode>({useFileTree, renderItem}: FileTreeProps<T>) {
    const {nodes} = useFileTree()
  
    return (
      <div>
        {nodes && (
          <ul>
            {nodes[ROOT_PATH].map((c) => (
              <BinderNode<T>
                ctx={c}
                renderItem={renderItem}
                key={c.id}
                {...c}
                getChildren={(pathToChildren: string) => nodes[pathToChildren] || []}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }
  
  export function ExpandableFileTreeItem<TNodeType extends SimpleNode>({
    children,
    renderItem,
    ctx,
  }: PropsWithChildren<FileTreeNodeProps<TNodeType>>) {
    const [expanded, setExpanded] = useState(false);
    return (
      <>
        <li
          onClick={() => setExpanded(!expanded)}
          className="p-1 ml-2 pl-2 text-sm font-semibold text-slate-600 cursor-pointer rounded-lg hover:bg-slate-300 hover:text-white"
        >
          {renderItem(ctx)}
        </li>
        {expanded && <ul className="ml-5 pl-2 border-l">{children}</ul>}
      </>
    );
  }
  
  export function FileTreeItem<TNodeType extends SimpleNode>({
    ctx,
    renderItem,
  }: Omit<FileTreeNodeProps<TNodeType>, "items">) {
    return <li>{renderItem(ctx)}</li>;
  }
  
  export function BinderNode<TNodeType extends SimpleNode>(props: FileTreeNodeProps<TNodeType>) {
    if (!props.isCollection) {
      return <FileTreeItem {...props} />;
    }
  
    const children = props.getChildren ? props.getChildren(`${props.path}/${props.id}`) : [];
  
    return (
      <ExpandableFileTreeItem {...props}>
        {children &&
          children.map((item) => (
            <BinderNode
              ctx={item}
              renderItem={props.renderItem}
              key={Math.random() * 4}
              getChildren={props.getChildren}
              {...item}
            />
          ))}
      </ExpandableFileTreeItem>
    );
  }