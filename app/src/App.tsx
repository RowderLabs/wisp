import { useEffect, useRef } from "react";
import { FamilyTreeNodeData, TreeNode } from "./rspc/bindings";
import { rspc } from "./rspc/router";
import * as d3 from "d3";
import pfp from "./assets/pfp.png";
import { createChildPath } from "./paths";
import Binder from "./ui/Binder";
import FamilyTree from "./ui/FamilyTree";
import { AttributePanel } from "./AttributePanel";

function App() {

  return (
    <div className="flex gap-4 h-screen">
      <div className="h-full w-[300px] shadow-md border">
        <Binder />
      </div>
      <div>
        <AttributePanel />
      </div>
    </div>
  );
}

export default App;
