import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getSelection, $insertNodes, COMMAND_PRIORITY_LOW } from "lexical";
import { $createMentionNode, INSERT_MENTION_NODE } from "../nodes/MentionNode";
import { Button } from "../Button";


interface MentionPluginProps {}

export default function MentionsPlugin({
}: MentionPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(INSERT_MENTION_NODE, (name) => {
      const mention = $createMentionNode(name)
      $insertNodes([mention])
      console.log(mention.exportJSON())
    
      return true;
    }, COMMAND_PRIORITY_LOW)

  })

  return <Button onClick={() => editor.dispatchCommand(INSERT_MENTION_NODE, 'Bob')}>Insert mention</Button>;
}
