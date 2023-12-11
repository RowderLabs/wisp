import { ImageUploadOverlay, ImageUploader, PanelCanvas, TreeView } from "@wisp/ui";
import { TreeData, useTreeView } from "@wisp/ui/src/hooks";
import { Banner } from "./ui/Banner";

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
    <div className="flex gap-2 h-screen bg-neutral text-slate-700">
      <div className="h-full basis-[300px] shadow-md border bg-white">
        <TreeView onExpansionChange={treeApi.toggleExpand} treeData={treeData} indentation={25} {...treeApi} />
      </div>
      <div className="basis-full h-[800px] px-4">
        <ImageUploader>
          {({ wrapperStyle, ...props }) => (
            <Banner style={wrapperStyle} className="bg-slate-300">
              <ImageUploadOverlay {...props} />
            </Banner>
          )}
        </ImageUploader>
        <PanelCanvas />
      </div>
    </div>
  );
}

export default App;
