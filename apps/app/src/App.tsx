import { ImageUploadOverlay, ImageUploader, PanelCanvas, TreeView } from "@wisp/ui";
import { TreeData, useTreeView } from "@wisp/ui/src/hooks";
import { Banner } from "./ui/Banner";
import WispEditor from "./ui/WispEditor";
import CharacterSummary from "./ui/CharacterSummary";

function App() {
  const data: TreeData = {
    root: {
      id: "root",
      name: "root",
      children: ["characters", "timelines"],
    },
    characters: {
      id: "characters",
      children: ["sage"],
      name: "Characters",
    },
    timelines: {
      id: "timelines",
      children: ["the-first-war"],
      name: "Timelines",
    },
    "the-first-war": {
      id: "the-first-war",
      children: [],
      name: "The First War",
    },
    sage: {
      id: "sage",
      children: [],
      name: "Sage",
    },
  };
  const [treeData, treeApi] = useTreeView({ initialData: data });

  return (
    <div className="flex gap-2 h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        <TreeView onExpansionChange={treeApi.toggleExpand} treeData={treeData} indentation={25} {...treeApi} />
      </div>
      <CharacterSummary/>
    </div>
  );
}

export default App;
