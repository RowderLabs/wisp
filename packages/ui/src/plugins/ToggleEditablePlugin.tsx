import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalEditor } from "lexical";
import { useEffect, useLayoutEffect } from "react";

type ToggleEditablePluginProps = {
  editable?: boolean;
  onEditableChange?: (status: boolean, editor: LexicalEditor) => void;
};
export function ToggleEditablePlugin({ editable, onEditableChange }: ToggleEditablePluginProps) {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    editor.setEditable(editable ?? true);
    if (onEditableChange) onEditableChange(editor.isEditable(), editor)
  }, [editor, editable]);

  return null;
}
