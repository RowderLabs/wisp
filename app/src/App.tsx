import Binder from "./ui/Binder";
import { AttributePanel } from "./ui/AttributePanel";
import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";
import { CharacterCreationModal } from "./ui/CharacterCreationModal";
import { EditableText } from "./ui/EditableText";

function App() {
  const queryClient = rspc.useContext().queryClient
  const { data: character } = rspc.useQuery(["characters.with_id", 1]);
  const { mutate: updateName } = rspc.useMutation("characters.change_name", {onSuccess: () => {
    queryClient.invalidateQueries(['characters.with_id', 1])
  }});

  return (
    <div className="flex gap-4 h-screen">
      <div className="h-full w-[300px] shadow-md border">
        <Binder />
      </div>
      <div className="basis-full mx-20">
        <div className="relative">
          <Banner />
          <div className="flex gap-4 px-4 py-2 items-start">
            <div className="h-48 w-48 bg-blue-500 rounded-md border-8 border-white mt-[-100px]"></div>
            {character && (
              <EditableText onSubmit={(text) => updateName({ id: character.id, name: text })}>
                {character.name || ""}
              </EditableText>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <div>{character && <AttributePanel attributes={character.attributes} />}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
