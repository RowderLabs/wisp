import type { OnChangeHandler, OnChangePluginProps } from './plugins/OnChangePlugin'
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
import { useCallback, useEffect } from "react";
import MentionsPlugin from './plugins/MentionsPlugin';
import { MentionNode } from './nodes/MentionNode';
import { ToggleEditablePlugin } from './plugins/ToggleEditablePlugin';
import { ZeroWidthPlugin } from './plugins/ZeroWidthPlugin';
import { ZeroWidthNode } from './nodes/ZeroWidthNode';
import { $getRoot } from 'lexical';

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
  editable?: boolean,
  editorTheme?: LexicalEditorProps["initalConfig"]["theme"];

  onChange?: OnChangeHandler
  pluginOpts?: {
    onChange: Partial<Omit<OnChangePluginProps, 'onChange'>>
  }
};

export default function TextEditor({ className, features, editorTheme, onChange, initial, pluginOpts, editable }: TextEditorProps) {
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

    editorState: (initial ?? undefined) || undefined,
    editable,
    theme: editorTheme || {
      heading: {
        h1: "text-[24px] m-0  text-slate-600",
        h2: "text-[18px] m-0  text-slate-800",
        h3: "text-[16px] m-0  text-slate-800",
      },
      list: {
        listitem: "list-disc list-outside mx-[32px]",
        nested: {
          listitem: "!list-none before:display-none after:display-none",
        },
        ul: "list-inside m-0 p-0",
      },
    },
    onError,
    nodes: [ListNode, ListItemNode, HeadingNode, MentionNode, ZeroWidthNode],
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
          contentEditable={<ContentEditable className="editor editor-input cursor-text" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <TabIndentationPlugin />
        <MentionsPlugin/>
        <HistoryPlugin />
        {onChange && <OnChangePlugin {...pluginOpts?.onChange} onChange={onChange} />}
        <ToggleEditablePlugin editable={editable} onEditableChange={(canEdit, editor) => {
          if(canEdit) {
            //focus editor and select end of text
            editor.focus()
            editor.update(() => {
              $getRoot().selectEnd()
            })
          }
        }}/>
        <ToggleEditablePlugin editable={editable} onEditableChange={(status) => console.log(`editor in ${status ? 'edit' : 'read'} mode`)}/>
        {/**Temporary fix for https://github.com/facebook/lexical/issues/4487 */}
        <ZeroWidthPlugin/>
      </div>
    </LexicalComposer>
  );
}

