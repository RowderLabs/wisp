import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import {ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND} from '@lexical/list'
import {ListPlugin} from '@lexical/react/LexicalListPlugin'
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import ComponentPickerPlugin from "../plugins/ComponentPickerPlugin";

export default function WispEditor() {
  const theme = {};

  function onError(err: Error) {
    console.error(err);
  }
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [ListNode, ListItemNode]
  }

  

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ComponentPickerPlugin/>
      <ListPlugin/>
      <RichTextPlugin
        contentEditable={<ContentEditable className="rounded-lg p-8 border" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </LexicalComposer>
  );
}
