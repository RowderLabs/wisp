import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread, createCommand } from "lexical";
import { ReactNode } from "react";
import { cva } from "class-variance-authority";

export const INSERT_MENTION_NODE = createCommand<string>();

export type SerializedMentionNode = Spread<
  {
    name: string;
  },
  SerializedLexicalNode
>;

export class MentionNode extends DecoratorNode<ReactNode> {
  __name: string;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__name, node.__key);
  }

  constructor(name: string, key?: NodeKey) {
    super(key);
    this.__name = name;
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedMentionNode {
    return {
      name: this.__name,
      type: this.getType(),
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    return $createMentionNode(serializedNode.name);
  }

  decorate(): ReactNode {
    return <Mention name={this.__name} />;
  }
}

type MentionProps = {
  name: string;
};

export function $createMentionNode(name: string) {
  return new MentionNode(name);
}

const mentionVariants = cva(['rounded-md bg-blue-200 p-0.5 text-blue-600/80', 'hover:text-white hover:bg-blue-400/80'])

function Mention({ name }: MentionProps) {
  return (
    <span
      className={mentionVariants()}
    >
      @{name}
    </span>
  );
}
