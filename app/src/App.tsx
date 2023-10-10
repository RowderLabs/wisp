import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";
import { EditableInline } from "./ui/EditableInline";
import { useEditCharacter } from "./hooks/useEditCharacter";
import WispEditor from "./ui/WispEditor";
import UploadableImage from "./ui/UploadableImage";
import { createFileTree } from "./context/FileTreeContext";
import FileTree from "./ui/FileTree";
import { BinderCharacterPath } from "./rspc/bindings";
import { HiUser, HiUsers } from "react-icons/hi";

function App() {
  const { data: character } = rspc.useQuery(["characters.with_id", 1]);
  const { changeName } = useEditCharacter();
  const { data: characters } = rspc.useQuery(["binder.characters", null]);
  const { FileTreeContext, useFileTree } = createFileTree<BinderCharacterPath>();

  return (
    <div className="flex gap-4 h-screen">
      <div className="h-full w-[300px] shadow-md border">
        <FileTreeContext.Provider value={{ nodes: characters }}>
          <FileTree<BinderCharacterPath>
            useFileTree={useFileTree}
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
        </FileTreeContext.Provider>
      </div>
      <div className="basis-full mx-20">
        <div className="relative">
          <Banner className="relative">
            <UploadableImage uploadedImage={{ position: "right", fit: "contain" }} />
          </Banner>
          <div className="flex gap-4 px-4 py-2 items-start">
            <div className="relative h-48 w-48 bg-white rounded-md mt-[-100px] border shadow-sm">
              <UploadableImage uploadedImage={{ position: "right", fit: "contain" }} />
            </div>
            {character && (
              <EditableInline
                value={character.name}
                onSubmit={(text) => changeName({ id: character.id, name: text })}
              >
                <p className="text-xl py-2 font-semibold">{character.name || ""}</p>
              </EditableInline>
            )}
          </div>
        </div>
        <WispEditor />
      </div>
    </div>
  );
}

export default App;
