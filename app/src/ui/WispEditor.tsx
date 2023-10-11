import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import {HeadingNode} from '@lexical/rich-text'
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
      heading: {
        h1: 'text-2xl',
        h2: 'text-xl',
        h3: 'text-xl'
      },
      list: {
        listitem: 'list-disc ml-4',
        nested: {
          listitem: '!list-none before:display-none after:display-none'
        },
        ul: 'ml-2 list-inside',
      },
    },
    onError,
    nodes: [ListNode, ListItemNode, HeadingNode]
  }

  

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border bg-white relative max-w-[1000px] basis-full overflow-y-scroll shadow-sm rounded-md leading-6 text-slate-800 p-4">
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
