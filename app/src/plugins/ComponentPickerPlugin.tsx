import { createPortal } from "react-dom";
import {TextNode, LexicalEditor, $getSelection, $isRangeSelection} from 'lexical'
import {INSERT_UNORDERED_LIST_COMMAND} from '@lexical/list'
import {$createHeadingNode} from '@lexical/rich-text';
import {$setBlocksType} from '@lexical/selection';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {HiDotsVertical} from 'react-icons/hi'
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  name: string;
  // Icon for display
  icon?: JSX.Element;
  // For extra searching.
  aliases: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.name = title;
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
        new ComponentPickerOption(`Heading ${n}`, {
          icon: <i className={`icon h${n}`} />,
          keywords: ['heading', 'header', `h${n}`],
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
              }
            }),
        }),
    ),
    new ComponentPickerOption('Bulleted List', {
      icon: <HiDotsVertical/>,
      keywords: ['bulleted list', 'unordered list', 'ul'],
      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    })
  ]
}

export default function ComponentPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", { minLength: 0 });
  const [query, setQuery] = useState<string | null>(null);
  const options = useMemo(() => {
    const baseOpts = getBaseOptions(editor)
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
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove()
        selectedOption.onSelect(matchingString)
        closeMenu();
      });
    },
    [editor],
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
        console.log(anchorElementRef.current);
        return anchorElementRef.current
          ? createPortal(
              <div className="p-2 bg-white shadow-lg min-w-[200px] text-sm mt-6">
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
  index,
  onClick,
  onMouseEnter,
  option,
}: ComponentPickerMenuItemProps) => {
  return (
    <li
      className={clsx(selected ? "bg-slate-100" : "", "shadow-sm")}
      key={index}
      tabIndex={-1}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex gap-1 items-center">
        {option.icon}
        <span>{option.name}</span></div>
    </li>
  );
};
