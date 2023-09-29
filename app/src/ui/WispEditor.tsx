import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

export default function WispEditor() {
  const theme = {};

  function onError(err: Error) {
    console.error(err);
  }
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable  className="rounded-lg p-4 border"/>}
        placeholder={<div>Type something...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </LexicalComposer>
  );
}
