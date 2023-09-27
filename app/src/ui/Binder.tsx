import { PropsWithChildren, useState } from "react";
import { useBinder } from "./useBinder";
import { BinderCharacterPath } from "../rspc/bindings";
import { HiUser, HiUsers } from "react-icons/hi";
import { EditableInline } from "./EditableInline";
import { useEditCharacter } from "../hooks/useEditCharacter";

interface SimpleNode {
  id: number;
  name: string | null;
  path: string;
  isCollection: boolean;
}

interface BinderNodeProps<TNodeType extends SimpleNode> {
  id: number;
  name: string | null;
  path: string;
  isCollection: boolean;
  ctx: TNodeType;
  renderItem: (ctx: TNodeType) => React.ReactNode;
  getChildren?: (pathToChildren: string) => TNodeType[];
}

const ROOT_PATH = "/characters";

export default function Binder() {
  const { characters } = useBinder();
  const { changeName } = useEditCharacter();

  return (
    <div>
      {characters && (
        <ul>
          {characters[ROOT_PATH].map((c) => (
            <BinderNode<BinderCharacterPath>
              ctx={c}
              renderItem={({ name, isCollection, item }) =>
                isCollection ? (
                  <div className="flex gap-1 items-center">
                    <HiUsers />
                    <span className="basis-full">{name}</span>
                  </div>
                ) : (
                  <li className="p-1 ml-2 pl-2 flex gap-1 items-center text-sm font-semibold text-slate-600 cursor-pointer rounded-lg">
                    <div className="flex gap-1 items-center">
                      <HiUser />
                      <EditableInline
                        value={item?.character?.name || ""}
                        onSubmit={(name) => {
                          if (item?.character?.id) {
                            changeName({ id: item.character.id, name });
                          }
                        }}
                      >
                        <span className="basis-full">{item?.character?.name}</span>
                      </EditableInline>
                    </div>
                  </li>
                )
              }
              key={Math.random() * 4}
              {...c}
              getChildren={(pathToChildren: string) => characters[pathToChildren] || []}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export function ExpandableBinderItem<TNodeType extends SimpleNode>({
  children,
  renderItem,
  ctx,
}: PropsWithChildren<BinderNodeProps<TNodeType>>) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <li
        onClick={() => setExpanded(!expanded)}
        className="p-1 ml-2 pl-2 text-sm font-semibold text-slate-600 cursor-pointer rounded-lg hover:bg-slate-300 hover:text-white"
      >
        {renderItem(ctx)}
      </li>
      {expanded && <ul className="ml-5 pl-2 border-l">{children}</ul>}
    </>
  );
}

export function BinderItem<TNodeType extends SimpleNode>({
  ctx,
  renderItem,
}: Omit<BinderNodeProps<TNodeType>, "items">) {
  return <li>{renderItem(ctx)}</li>;
}

export function BinderNode<TNodeType extends SimpleNode>(props: BinderNodeProps<TNodeType>) {
  if (!props.isCollection) {
    return <BinderItem {...props} />;
  }

  const children = props.getChildren ? props.getChildren(`${props.path}/${props.id}`) : [];

  return (
    <ExpandableBinderItem {...props}>
      {children &&
        children.map((item) => (
          <BinderNode
            ctx={item}
            renderItem={props.renderItem}
            key={Math.random() * 4}
            getChildren={props.getChildren}
            {...item}
          />
        ))}
    </ExpandableBinderItem>
  );
}
