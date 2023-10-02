import { createPortal } from "react-dom";
import {TextNode} from 'lexical'
import {INSERT_UNORDERED_LIST_COMMAND} from '@lexical/list'
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";

export default function ComponentPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", { minLength: 0 });
  const [query, setQuery] = useState<string | null>(null);
  const options = useMemo(() => {
    const baseOpts = [new MenuOption("List")];
    if (!query) {
      return baseOpts;
    }
    const regex = new RegExp(query, "i");
    return baseOpts.filter((item) => regex.test(item.key));
  }, [editor, query]);

  const onSelectOption = useCallback(
    (
      selectedOption: MenuOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove()
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MenuOption>
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
                      option={item.key}
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
  option: string;
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
      <span>{option}</span>
    </li>
  );
};
