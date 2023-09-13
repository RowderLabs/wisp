import { FC, ReactNode } from "react";
import {Tree, NodeRendererProps, SimpleTreeData} from 'react-arborist'
import { rspc } from "../rspc/router";

type BinderProps<T extends SimpleTreeData> = {
    data: T[]
    children: FC<NodeRendererProps<T>>
}

export default function FileTree<T extends SimpleTreeData>({data, children}: BinderProps<T>) {
    const {data: characters} = rspc.useQuery(['binder.characters'])
    return (
        <div className="flex justify-center">
            <Tree width={290} initialData={data} rowHeight={28} padding={20}>
                {children}
            </Tree>
        </div>
    )
}


