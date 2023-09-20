// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "binder.characters", input: string | null, result: { id: number; isCollection: boolean; path: string; name: string; itemType: string | null; character: { id: number; name: string } | null; itemPaths: BinderPath[] }[] } | 
        { key: "display_tree", input: number, result: TreeData<FamilyTreeNodeData> } | 
        { key: "version", input: never, result: string },
    mutations: never,
    subscriptions: never
};

export type FamilyTreeNodeData = { name: string }

export type TreeLink = { source: TreeLinkData; target: TreeLinkData; link: TreeLinkData }

export type TreeNode<T> = { id: string; parentId: string | null; hidden: boolean; nodeData: T | null }

export type TreeData<T> = { nodes: TreeNode<T>[]; links: TreeLink[] }

export type BinderPath = { id: number; path: string; itemId: number | null }

export type TreeLinkData = string
