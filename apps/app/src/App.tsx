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
import { PanelGroup } from "./ui/PanelGroup";

function App() {

  return (
    <div className="flex gap-4 h-screen bg-neutral text-slate-700">
      <div className="h-full w-[300px] shadow-md border bg-white">
        <Binder />
      </div>
      <div className="w-[1200px] h-[800px]">
          <PanelGroup/>
      </div>
    </div>
  );
}

export default App;
