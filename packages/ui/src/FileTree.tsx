import React, { PropsWithChildren } from 'react'
export interface SimpleNode {
    id: number;
    name: string | null;
    path: string;
    expanded: boolean
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
    toggleExpanded?: (id: number) => void
  }


  type FileTreeProps<T> = {
    rootPath: string
    toggleExpanded: (id: number) => void
    renderItem: (ctx: T) => React.ReactNode;
    nodes: {[key: string]: T[]}
  }
  
  
  export function FileTree<T extends SimpleNode>({nodes, renderItem, toggleExpanded, rootPath}: FileTreeProps<T>) {
    
    return (
      <div>
        {nodes && (
          <ul>
            {nodes[rootPath].map((c) => (
              <FileTreeNode<T>
                ctx={c}
                renderItem={renderItem}
                key={c.id}
                {...c}
                toggleExpanded={toggleExpanded}
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
    toggleExpanded,
    ctx,
  }: PropsWithChildren<FileTreeNodeProps<TNodeType>>) {
    return (
      <>
        <div
          onClick={() => {if(toggleExpanded) toggleExpanded(ctx.id)}}
          className="p-1 ml-2 pl-2 text-sm font-semibold text-slate-600 cursor-pointer rounded-lg hover:bg-slate-300 hover:text-white"
        >
          {renderItem(ctx)}
        </div>
        {ctx.expanded && <ul className="ml-5 pl-2 border-l">{children}</ul>}
      </>
    );
  }
  
  export function FileTreeItem<TNodeType extends SimpleNode>({
    ctx,
    renderItem,
  }: Omit<FileTreeNodeProps<TNodeType>, "items">) {
    return <div>{renderItem(ctx)}</div>;
  }
  
  export function FileTreeNode<TNodeType extends SimpleNode>(props: FileTreeNodeProps<TNodeType>) {
    if (!props.isCollection) {
      return <FileTreeItem {...props} />;
    }
  
    const children = props.getChildren ? props.getChildren(`${props.path}/${props.id}`) : [];
  
    return (
      <ExpandableFileTreeItem {...props}>
        {children &&
          children.map((item) => (
            <FileTreeNode
              ctx={item}
              renderItem={props.renderItem}
              key={Math.random() * 4}
              getChildren={props.getChildren}
              toggleExpanded={props.toggleExpanded}
              {...item}
            />
          ))}
      </ExpandableFileTreeItem>
    );
  }