import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";

export default function WispBlockEditor() {
  const editor: BlockNoteEditor = useBlockNote({});
  return <BlockNoteView editor={editor} theme={"light"} />;
}
