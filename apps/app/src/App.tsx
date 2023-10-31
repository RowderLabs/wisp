import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";
import { EditableInline } from "./ui/EditableInline";
import { useEditCharacter } from "./hooks/useEditCharacter";
import WispEditor from "./ui/WispEditor";
import UploadableImage from "./ui/UploadableImage";
import Binder from "./ui/Binder";
import { ImageUploadOverlay, ImageUploader } from "@wisp/ui";
import clsx from "clsx";

function App() {
  const { data: character } = rspc.useQuery(["characters.with_id", 1]);
  const { changeName } = useEditCharacter();

  return (
    <div className="flex gap-4 h-screen bg-neutral text-slate-700">
      <div className="h-full w-[300px] shadow-md border">
        <Binder />
      </div>
      <div className="basis-full flex flex-col">
        <div className="relative">
          <ImageUploader>
            {({ wrapperStyles, ...props }) => (
              <Banner
                className={wrapperStyles}
              >
                <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
              </Banner>
            )}
          </ImageUploader>
          <div className="flex gap-4 p-4 items-start">
            <ImageUploader>
              {({ wrapperStyles, ...props }) => (
                <div
                  className={clsx(
                    wrapperStyles,
                    "h-48 w-48 bg-white rounded-md mt-[-100px] border shadow-sm"
                  )}
                >
                  <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
                </div>
              )}
            </ImageUploader>

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
