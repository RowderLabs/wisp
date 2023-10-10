import React from "react";

export type FileTreeContextProps<T = any> = {
  nodes?: { [key: string]: T[] };
};


export function createFileTreeContext<T = unknown>() {
  return React.createContext<FileTreeContextProps<T> | null>(null)
}

export function createFileTree<T = unknown>() {
  const FileTreeContext = createFileTreeContext<T>()
  if (!FileTreeContext) throw new Error('oh no')
  const useFileTree = () => React.useContext(FileTreeContext) as FileTreeContextProps<T>

  return {FileTreeContext, useFileTree}
}

