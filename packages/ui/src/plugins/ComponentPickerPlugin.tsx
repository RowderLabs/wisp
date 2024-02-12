import { createPortal } from "react-dom";
import { TextNode, LexicalEditor, $getSelection, $isRangeSelection } from "lexical";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HiDotsVertical, HiOutlinePencil } from "react-icons/hi";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { TextEditorFeatures } from "../TextEditor";
type TypeaheadFlag = keyof Exclude<TextEditorFeatures["typeahead"], boolean>;

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  name: string;
  // Icon for display
  icon?: JSX.Element;
  flag: TypeaheadFlag;
  tip?: string;
  // For extra searching.
  aliases: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    flag: TypeaheadFlag,
    options: {
      tip?: string;
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    }
  ) {
    super(title);
    this.name = title;
    this.flag = flag;
    this.tip = options.tip;
    this.aliases = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

const getBaseOptions = (editor: LexicalEditor) => {
  return [
    ...([1, 2, 3] as const).map(
      (n) =>
        new ComponentPickerOption(`Heading ${n}`, "headings", {
          tip: "Heading Tip",
          icon: <HiOutlinePencil />,
          keywords: ["heading", "header", `h${n}`],
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
              }
            }),
        })
    ),
    new ComponentPickerOption("Bulleted List", "lists", {
      tip: "Can be used to display unordered list with a really long tip",
      icon: <HiDotsVertical />,
      keywords: ["bulleted list", "unordered list", "ul"],
      onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
  ];
};

type ComponentPickerPluginProps = {
  features: TextEditorFeatures["typeahead"];
};
export default function ComponentPickerPlugin({ features }: ComponentPickerPluginProps) {
  const [editor] = useLexicalComposerContext();
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", { minLength: 0 });
  const [query, setQuery] = useState<string | null>(null);
  const options = useMemo(() => {
    const baseOpts = getBaseOptions(editor).filter((opt) => {
      if (typeof features === 'boolean') return features
      return features[opt.flag]
    });
    if (!query) {
      return baseOpts;
    }
    const regex = new RegExp(query, "i");
    return baseOpts.filter((item) => regex.test(item.key));
  }, [editor, query]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
      onQueryChange={setQuery}
      onSelectOption={onSelectOption}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        return anchorElementRef.current && options.length > 0
          ? createPortal(
              <div className="p-2 bg-white shadow-lg min-w-[300px] text-sm mt-6">
                <ul>
                  {options.map((item, i) => (
                    <ComponentPickerMenuItem
                      key={i}
                      option={item}
                      selected={selectedIndex === i}
                      index={i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(item);
                      }}
                      onMouseEnter={() => setHighlightedIndex(i)}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null;
      }}
      triggerFn={checkForTriggerMatch}
    />
  );
}

type ComponentPickerMenuItemProps = {
  selected: boolean;
  index: number;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
};

const ComponentPickerMenuItem = ({
  selected,
  onClick,
  onMouseEnter,
  option,
}: ComponentPickerMenuItemProps) => {
  return (
    <li
      role="option"
      ref={option.setRefElement}
      className={clsx(selected ? "bg-slate-100" : "", "shadow-sm p-2 rounded-md")}
      key={option.key}
      tabIndex={-1}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex gap-3 items-center text-slate-800">
        <span className="text-base">{option.icon}</span>
        <div>
          <span className="block">{option.name}</span>
          <span className="text-xs block text-slate-500">{option.tip}</span>
        </div>
        <span>{/**keyboard shortcut */}</span>
      </div>
    </li>
  );
};
