import Binder from "./ui/Binder";
import { AttributePanel } from "./ui/AttributePanel";
import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";
import { EditableInline } from "./ui/EditableInline";
import WispBlockEditor from "./ui/WispBlockEditor";
import { useEditCharacter } from "./hooks/useEditCharacter";
import { useCreateCharacter } from "./hooks/useCreateCharacter";
import { useDeleteCharacter } from "./hooks/useDeleteCharacter";

function App() {
  const { data: character } = rspc.useQuery(["characters.with_id", 1]);
  const { changeName } = useEditCharacter();
  const { deleteCharacter, error } = useDeleteCharacter();
  return (
    <div className="flex gap-4 h-screen">
      <div className="h-full w-[300px] shadow-md border">
        {JSON.stringify(error)}
        <Binder />
      </div>
      <div className="basis-full mx-20">
        <div className="relative">
          <Banner />
          <div className="flex gap-4 px-4 py-2 items-start">
            <div className="h-48 w-48 bg-blue-500 rounded-md border-8 border-white mt-[-100px]"></div>
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
        <div className="flex gap-4 justify-between">
          <div className="p-4 border basis-full">
            <WispBlockEditor />
            <button onClick={() => deleteCharacter("Lord")}>Delete</button>
          </div>
          <div>{character && <AttributePanel attributes={character.attributes} />}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
