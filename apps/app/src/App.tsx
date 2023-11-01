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
  const [panel, setPanel] = useState<Omit<PanelProps, 'id'>>()
  const setImagePanel = () => {
    setPanel(createPanel('image', {}))
  }


  return (
    <div className="flex gap-4 h-screen bg-neutral text-slate-700">
      <div className="h-full w-[300px] shadow-md border bg-white">
        <Binder />
      </div>
      <div style={{height: '600px', width: '900px'}} className="grid grid-cols-3">
        {panel && <Panel id={1} {...panel} />}
      </div>
      <button onClick={setImagePanel}>Set To Image</button>
    </div>
  );
}

export default App;
