import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin";
import clsx from "clsx";
import { useCallback } from "react";

//type FeatureFlags = { typeahead?: Partial<TypeaheadFlags> } & { full: true };

type FeatureFlags<T> = {
  [K in keyof T]: T[K] extends object ? Partial<FeatureFlags<T[K]>> | true : true;
};

export type TextEditorFeatures = FeatureFlags<{
  typeahead: {
    lists: boolean;
    headings: boolean;
  };
}>;

type OptTextEditorFeatures = Partial<TextEditorFeatures>;

type LexicalEditorProps = {
  initalConfig: Parameters<typeof LexicalComposer>["0"]["initialConfig"];
};

type TextEditorProps = {
  className?: string;
  features: OptTextEditorFeatures;
  editorTheme?: LexicalEditorProps["initalConfig"]["theme"];
};

export default function TextEditor({ className, features, editorTheme }: TextEditorProps) {
  function onError(err: Error) {
    console.error(err);
  }

  const featureEnabled = useCallback(
    (flag?: Omit<TextEditorFeatures, "full">[keyof Omit<TextEditorFeatures, "full">]) => {
      return Boolean(flag);
    },
    [features]
  );

  const initialConfig: LexicalEditorProps["initalConfig"] = {
    namespace: "MyEditor",
    theme: editorTheme || {
      heading: {
        h1: "text-2xl",
        h2: "text-xl",
        h3: "text-xl",
      },
      list: {
        listitem: "list-disc ml-4",
        nested: {
          listitem: "!list-none before:display-none after:display-none",
        },
        ul: "ml-2 list-inside",
      },
    },
    onError,
    nodes: [ListNode, ListItemNode, HeadingNode],
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={clsx(
          className,
          "relative overflow-auto min-w-[300px] min-h-[150px] h-full leading-6 text-slate-700"
        )}
      >
        {features.typeahead && featureEnabled(features.typeahead) && (
          <>
            <ComponentPickerPlugin features={features.typeahead} />
            <ListPlugin />
          </>
        )}

        <RichTextPlugin
          contentEditable={<ContentEditable className="editor editor-input" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <TabIndentationPlugin />
        <HistoryPlugin />
      </div>
    </LexicalComposer>
  );
}
