// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "display_tree", input: number, result: TreeData<FamilyTreeNodeData> } | 
        { key: "version", input: never, result: string },
    mutations: never,
    subscriptions: never
};

export type TreeData<T> = { nodes: TreeNodeType<T>[]; links: TreeLink[] }

export type TreeLinkData = string

export type TreeLink = { source: TreeLinkData; target: TreeLinkData; link: TreeLinkData }

export type FamilyTreeNodeData = { name: string }

export type TreeNode = { id: string; parent_id: string | null; hidden: boolean }

export type TreeNodeType<T> = { Node: TreeNode } | { WithData: TreeNodeWithData<T> }

export type TreeNodeWithData<T> = { id: string; parent_id: string | null; hidden: boolean; data: T }