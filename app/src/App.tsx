import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";
import { EditableInline } from "./ui/EditableInline";
import { useEditCharacter } from "./hooks/useEditCharacter";
import WispEditor from "./ui/WispEditor";
import UploadableImage from "./ui/UploadableImage";
import Binder from "./ui/Binder";

function App() {
  const { data: character } = rspc.useQuery(["characters.with_id", 1]);
  const { changeName } = useEditCharacter();

  return (
    <div className="flex gap-4 h-screen bg-neutral text-slate-700">
      <div className="h-full w-[300px] shadow-md border">
        <Binder/>
      </div>
      <div className="basis-full">
        <div className="relative">
          <Banner className="relative">
            <UploadableImage uploadedImage={{ position: "center", fit: "cover" }} />
          </Banner>
          <div className="flex gap-4 p-4 items-start">
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
