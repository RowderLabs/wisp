import { FC, ReactNode } from "react";
import {Tree, NodeRendererProps, SimpleTreeData} from 'react-arborist'

type FileTreeProps<T extends SimpleTreeData> = {
    data: T[]
    children: FC<NodeRendererProps<T>>
}

export default function FileTree<T extends SimpleTreeData>({data, children}: FileTreeProps<T>) {
    return (
        <div className="flex justify-center">
            <Tree width={290} initialData={data} rowHeight={28} padding={20}>
                {children}
            </Tree>
        </div>
    )
}


