import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { $createTextNode, $insertNodes, COMMAND_PRIORITY_LOW, TextNode } from "lexical";
import { $createMentionNode, INSERT_MENTION_NODE_COMMAND, MentionNode } from "../nodes/MentionNode";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { rspc } from "@wisp/client";

class MentionOption extends MenuOption {
  // What shows up in the editor
  id: string;
  name: string;
  // Icon for display
  // For extra searching.
  // TBD
  // What happens when you select this option?

  constructor(id: string, name: string) {
    super(name);
    this.name = name;
    this.id = id;
  }
}

export default function MentionsPlugin() {
  const { data: mentions } = rspc.useQuery(["characters.list_links"], {
    select: (data) => data.map((link) => new MentionOption(link.id, link.name)),
  });
  const [editor] = useLexicalComposerContext();

  if (!editor.hasNodes([MentionNode])) {
    throw new Error("Missing MentionNode registration in Lexical Composer");
  }

  const [query, setQuery] = useState<string | null>(null);
  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("@", { minLength: 0 });
  useEffect(() => {
    return editor.registerCommand(
      INSERT_MENTION_NODE_COMMAND,
      (payload) => {
        const mention = $createMentionNode(payload.id, payload.name);
        $insertNodes([mention, $createTextNode(" ")]);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  });

  const options = useMemo(
    () => {
      return mentions?.filter((opt) => {
        if (query) {
          return opt.name.toLowerCase().includes(query.toLowerCase());
        }
        return opt;
      }) ?? []},
    [query, mentions]
  );

  const onSelectOption = useCallback(
    (selectedOption: MentionOption, nodeToRemove: TextNode | null, closeMenu: () => void, matchingString: string) => {
      editor.update(() => {
        nodeToRemove?.remove();
        console.log(matchingString);
        editor.dispatchCommand(INSERT_MENTION_NODE_COMMAND, { id: selectedOption.id, name: selectedOption.name });
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionOption>
      triggerFn={checkForTriggerMatch}
      onQueryChange={setQuery}
      onSelectOption={onSelectOption}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
        return anchorElementRef.current && options.length > 0
          ? createPortal(
              <div className="p-2 bg-white shadow-lg min-w-[150px] text-sm mt-6">
                <ul>
                  {options.map((item, i) => (
                    <MentionMenuItem
                      key={i}
                      mention={item}
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
    />
  );
}

type MentionMenuItemProps = {
  selected: boolean;
  index: number;
  onClick: () => void;
  onMouseEnter: () => void;
  mention: MentionOption;
};

const MentionMenuItem = ({ selected, onClick, onMouseEnter, mention }: MentionMenuItemProps) => {
  return (
    <li
      role="option"
      ref={mention.setRefElement}
      className={clsx(selected ? "bg-slate-100" : "", "shadow-sm p-2 rounded-md")}
      key={mention.key}
      tabIndex={-1}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex gap-3 items-center text-slate-800">
        <div>
          <span className="block">{mention.name}</span>
        </div>
        <span>{/**keyboard shortcut */}</span>
      </div>
    </li>
  );
};
