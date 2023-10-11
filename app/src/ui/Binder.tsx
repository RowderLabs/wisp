import { queryClient, rspc } from "../rspc/router";
import { BinderCharacterPath } from "../rspc/bindings";
import FileTree from "./FileTree";
import { HiUser, HiUsers } from "react-icons/hi";
import { EditableInline } from "./EditableInline";
import { useEditCharacter } from "../hooks/useEditCharacter";

export default function Binder() {
  const { data: characters } = rspc.useQuery(["binder.characters", null]);
  const { changeName } = useEditCharacter();
  const { mutate } = rspc.useMutation(["binder.toggle_expanded"], {
    onSuccess: () => {
      queryClient.invalidateQueries(["binder.characters"]);
      console.log("updated expanstion");
    },
  });
  const toggleExpanded = (id: number) => mutate(id);

  return (
    <div>
      {characters && (
        <FileTree<BinderCharacterPath>
          nodes={characters}
          toggleExpanded={toggleExpanded}
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
        />
      )}
    </div>
  );
}
