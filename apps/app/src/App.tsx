import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";
import { EditableInline } from "./ui/EditableInline";
import { useEditCharacter } from "./hooks/useEditCharacter";
import WispEditor from "./ui/WispEditor";
import UploadableImage from "./ui/UploadableImage";
import Binder from "./ui/Binder";
import { ImageUploadOverlay, ImageUploader, Panel, PanelProps, createPanel } from "@wisp/ui";
import clsx from "clsx";
import { useState } from "react";

function App() {
  const [panel, setPanel] = useState<Omit<PanelProps, "id">>(createPanel('gallery', {itemCount: 4}));

  return (
    <div className="flex gap-4 h-screen bg-neutral text-slate-700">
      <div className="h-full w-[300px] shadow-md border bg-white">
        <Binder />
      </div>
      <div>
        <div className="w-[600px] h-[600px]">
          <Panel id={1} content={panel.content} />
        </div>
      </div>
    </div>
  );
}

export default App;
