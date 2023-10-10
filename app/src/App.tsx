import Binder from "./ui/Binder";
import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";
import { EditableInline } from "./ui/EditableInline";
import { useEditCharacter } from "./hooks/useEditCharacter";
import WispEditor from "./ui/WispEditor";
import UploadableImage from "./ui/UploadableImage";
import { FileTreeContextProps, createFileTree } from "./context/FileTreeContext";

const Tree = ({useFileTree}: {useFileTree: () => FileTreeContextProps<unknown>}) => {
  const {nodes} = useFileTree()
  return <div>{JSON.stringify(nodes)}</div>;
};

function App() {
  const { data: character } = rspc.useQuery(["characters.with_id", 1]);
  const { changeName } = useEditCharacter();
  const { data: characters } = rspc.useQuery(["binder.characters", null]);
  const {FileTreeContext, useFileTree} = createFileTree();

  return (
    <div className="flex gap-4 h-screen">
      <div className="h-full w-[300px] shadow-md border">
        <FileTreeContext.Provider value={{ nodes: characters }}>
          <Tree useFileTree={useFileTree}/>
        </FileTreeContext.Provider>
        <Binder />
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
