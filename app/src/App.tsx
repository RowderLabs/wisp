import { useEffect, useRef } from "react";
import { FamilyTreeNodeData, TreeNode } from "./rspc/bindings";
import { rspc } from "./rspc/router";
import * as d3 from "d3";
import pfp from "./assets/pfp.png";
import { createChildPath } from "./paths";
import Binder from "./ui/Binder";
import FamilyTree from "./ui/FamilyTree";
import { AttributePanel } from "./AttributePanel";
import { CharacterSheetBanner } from "./CharacterSheetBanner";

function App() {

  return (
    <div className="flex gap-4 h-screen">
      <div className="h-full w-[300px] shadow-md border">
        <Binder />
      </div>
      <div className="basis-full mx-20">
        <div className="relative">
          <CharacterSheetBanner />
          <div className="absolute h-48 w-48 bg-blue-500 bottom-[50%] transform translate-y-[105%] left-10 rounded-md border-8 border-white"></div>
        </div>
        <div className="mt-32">
          <AttributePanel />
        </div>
      </div>
    </div>
  );
}

export default App;
