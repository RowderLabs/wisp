import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread, createCommand } from "lexical";
import { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { Link } from "@tanstack/react-router";

export const INSERT_MENTION_NODE_COMMAND = createCommand<{ id: string; name: string }>();

export type SerializedMentionNode = Spread<
  {
    id: string;
    name: string;
  },
  SerializedLexicalNode
>;

export class MentionNode extends DecoratorNode<ReactNode> {
  __id: string;
  __name: string;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__id, node.__name, node.__key);
  }

  constructor(id: string, name: string, key?: NodeKey) {
    super(key);
    this.__id = id;
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
      id: this.__id,
      name: this.__name,
      type: this.getType(),
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    return $createMentionNode(serializedNode.id, serializedNode.name);
  }

  decorate(): ReactNode {
    return <Mention id={this.__id} name={this.__name} />;
  }
}

type MentionProps = {
  id: string;
  name: string;
};

export function $createMentionNode(id: string, name: string) {
  return new MentionNode(id, name);
}

const mentionVariants = cva(["rounded-md bg-blue-200 p-0.5 text-blue-600/80", "hover:text-white hover:bg-blue-400/80"]);

function Mention({ name, id }: MentionProps) {
  return (
    <Link className={mentionVariants()} to="/workspace/characters/$characterId" params={{ characterId: id }}>
      @{name}
    </Link>
  );
}
