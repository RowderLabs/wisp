import type { OnChangeHandler } from './plugins/OnChangePlugin'
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
import OnChangePlugin  from "./plugins/OnChangePlugin";
import clsx from "clsx";
import { useCallback } from "react";
import React from 'react';

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

export type TextEditorProps = {
  initial?: string | null
  className?: string;
  features: OptTextEditorFeatures;
  editorTheme?: LexicalEditorProps["initalConfig"]["theme"];
  onChange?: OnChangeHandler
};

export default function TextEditor({ className, features, editorTheme, onChange, initial }: TextEditorProps) {
  function onError(err: Error) {
    console.error(err);
  }

  React.useEffect(() => {
    console.log(initial)

  }, [initial])

  const featureEnabled = useCallback(
    (flag?: Omit<TextEditorFeatures, "full">[keyof Omit<TextEditorFeatures, "full">]) => {
      return Boolean(flag);
    },
    [features]
  );

  const initialConfig: LexicalEditorProps["initalConfig"] = {
    namespace: "MyEditor",
    editorState: (initial ?? undefined) || undefined,
    theme: editorTheme || {
      heading: {
        h1: "text-[24px] m-0  text-slate-600",
        h2: "text-[18px] m-0  text-slate-800",
        h3: "text-[16px] m-0  text-slate-800",
      },
      list: {
        listitem: "list-disc mx-[32px]",
        nested: {
          listitem: "!list-none before:display-none after:display-none",
        },
        ul: "list-inside m-0 p-0",
      },
    },
    onError,
    nodes: [ListNode, ListItemNode, HeadingNode],
  };
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={clsx(className, "overflow-y-auto h-[95%]", "relative leading-7 text-slate-700")}>
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
        {onChange && <OnChangePlugin ignoreSelectionChange={true} onChange={onChange} />}
      </div>
    </LexicalComposer>
  );
}

