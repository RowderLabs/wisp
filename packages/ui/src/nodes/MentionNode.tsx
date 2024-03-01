import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread, createCommand } from "lexical";
import { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { Link } from "@tanstack/react-router";
import { EntityType } from "@wisp/client/src/bindings";

export const INSERT_MENTION_NODE_COMMAND = createCommand<{ id: string; name: string, entityType: EntityType }>();

export type SerializedMentionNode = Spread<
  {
    id: string;
    name: string;
    entityType: EntityType
  },
  SerializedLexicalNode
>;

export class MentionNode extends DecoratorNode<ReactNode> {
  __id: string;
  __name: string;
  __entityType: EntityType

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__id, node.__name, node.__entityType, node.__key);
  }

  constructor(id: string, name: string, entityType: EntityType, key?: NodeKey) {
    super(key);
    this.__id = id;
    this.__name = name;
    this.__entityType = entityType
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
      entityType: this.__entityType,
      type: this.getType(),
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    return $createMentionNode(serializedNode.id, serializedNode.name, serializedNode.entityType);
  }

  decorate(): ReactNode {
    return <Mention id={this.__id} name={this.__name} entityType={this.__entityType} />;
  }
}

type MentionProps = {
  id: string;
  name: string;
  entityType: EntityType
};

export function $createMentionNode(id: string, name: string, entityType: EntityType) {
  return new MentionNode(id, name, entityType);
}

const mentionVariants = cva([
  "text-sm rounded-md bg-blue-200 p-0.5 text-blue-600/80",
  "hover:text-white hover:bg-blue-400/80",
]);

function Mention({ name, id, entityType }: MentionProps) {
  return (
    <Link
      className={mentionVariants()}
      to="/workspace/entity/$entityId"
      search={{ type: entityType }}
      params={{ entityId: id }}
    >
      @{name}
    </Link>
  );
}
