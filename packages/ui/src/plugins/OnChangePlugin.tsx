import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLayoutEffect } from "react";
import type { EditorState, LexicalEditor } from "lexical";
import { useDebounceCallback } from "usehooks-ts";

export type OnChangeHandler = (
  editorState: EditorState,
  editor: LexicalEditor,
  tags: Set<string>
) => void;

export interface OnChangePluginProps {
  ignoreHistoryMergeTagChange?: boolean;
  ignoreSelectionChange?: boolean;
  onChange: OnChangeHandler;
  debounce?: { duration?: number };
}

export default function OnChangePlugin({
  ignoreHistoryMergeTagChange = true,
  ignoreSelectionChange = true,
  onChange,
  debounce,
}: OnChangePluginProps): null {
  const [editor] = useLexicalComposerContext();
  const debouncedOnChange = useDebounceCallback(onChange, debounce?.duration ?? 500);

  useLayoutEffect(() => {
    if (onChange) {
      return editor.registerUpdateListener(
        ({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
          if (
            (ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0) ||
            (ignoreHistoryMergeTagChange && tags.has("history-merge")) ||
            prevEditorState.isEmpty()
          ) {
            return;
          }

          debouncedOnChange
            ? debouncedOnChange(editorState, editor, tags)
            : onChange(editorState, editor, tags);
        }
      );
    }
  }, [editor, ignoreHistoryMergeTagChange, ignoreSelectionChange, onChange]);

  return null;
}
