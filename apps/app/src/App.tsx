import { PanelCanvas, TreeView } from "@wisp/ui";
import { TreeData, useTreeView } from "@wisp/ui/src/hooks";

function App() {
  const data: TreeData = {
    root: {
      id: "root",
      name: "root",
      children: ["characters", "timelines"],
    },
    "characters": {
      id: "characters",
      children: ["sage"],
      name: "Characters",
    },
    "timelines": {
      id: "timelines",
      children: ["the-first-war"],
      name: "Timelines",
    },
    "the-first-war": {
      id: "the-first-war",
      children: [],
      name: "The First War"
    },
    "sage": {
      id: "sage",
      children: [],
      name: "Sage",
    },
  };
  const [treeData, treeApi] = useTreeView({ initialData: data });

  return (
    <div className="flex gap-4 h-screen bg-neutral text-slate-700">
      <div className="h-full w-[300px] shadow-md border bg-white">
        <TreeView
          onExpansionChange={treeApi.toggleExpand}
          treeData={treeData}
          indentation={25}
          {...treeApi}
        />
      </div>
      <div className="w-[1200px] h-[800px]">
        <PanelCanvas />
      </div>
    </div>
  );
}

export default App;
