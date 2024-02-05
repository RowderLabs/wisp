import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLayoutEffect } from "react";
import type { EditorState, LexicalEditor } from "lexical";


export type OnChangeHandler = (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void

export default function OnChangePlugin({
  ignoreHistoryMergeTagChange = true,
  ignoreSelectionChange = false,
  onChange,
}: {
  ignoreHistoryMergeTagChange?: boolean;
  ignoreSelectionChange?: boolean;
  onChange: OnChangeHandler;
}): null {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    if (onChange) {
      return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
        if (
          (ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
          (ignoreHistoryMergeTagChange && tags.has("history-merge")) ||
          prevEditorState.isEmpty()
        ) {
          return;
        }

        onChange(editorState, editor, tags);
      });
    }
  }, [editor, ignoreHistoryMergeTagChange, ignoreSelectionChange, onChange]);

  return null;
}
