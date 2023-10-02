import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import {ListNode, ListItemNode} from '@lexical/list'
import {ListPlugin} from '@lexical/react/LexicalListPlugin'
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import ComponentPickerPlugin from "../plugins/ComponentPickerPlugin";

type LexicalEditorProps = {
  initalConfig: Parameters<typeof LexicalComposer>['0']['initialConfig'];
};

export default function WispEditor() {


  function onError(err: Error) {
    console.error(err);
  }
  const initialConfig: LexicalEditorProps['initalConfig'] = {
    namespace: "MyEditor",
    theme: {
      list: {
        listitem: 'list-disc ml-4',
        nested: {
          listitem: '!list-none before:display-none after:display-none'
        },
        ul: 'ml-2 list-inside',
      },
    },
    onError,
    nodes: [ListNode, ListItemNode]
  }

  

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <ComponentPickerPlugin/>
        <ListPlugin/>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor editor-input" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <TabIndentationPlugin/>
        <HistoryPlugin />
      </div>
    </LexicalComposer>
  );
}
