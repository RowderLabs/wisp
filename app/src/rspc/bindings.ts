// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "display_tree", input: number, result: TreeData<FamilyTreeNodeData> } | 
        { key: "version", input: never, result: string },
    mutations: never,
    subscriptions: never
};

export type TreeNodeType<T> = TreeNode | TreeNodeWithData<T>

export type TreeNodeWithData<T> = ({ name: string }) & { id: string; parentId: string | null; hidden: boolean }

export type TreeLinkData = string

export type TreeLink = { source: TreeLinkData; target: TreeLinkData; link: TreeLinkData }

export type FamilyTreeNodeData = { name: string }

export type TreeData<T> = { nodes: TreeNodeType<T>[]; links: TreeLink[] }

export type TreeNode = { id: string; parentId: string | null; hidden: boolean }
