import { ImageUploadOverlay, ImageUploader, TreeView } from "@wisp/ui";
import { TreeData, useTreeView } from "@wisp/ui/src/hooks";
import { Banner } from "./ui/Banner";
import { Link, Outlet } from "@tanstack/react-router";

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
    <div className="flex h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        <TreeView onExpansionChange={treeApi.toggleExpand} treeData={treeData} indentation={25} {...treeApi} />
      </div>
      <div className="basis-full">
        <ImageUploader>
          {({ wrapperStyle, ...props }) => (
            <Banner style={wrapperStyle} className="bg-slate-300">
              <ImageUploadOverlay {...props} />
            </Banner>
          )}
        </ImageUploader>
        {/** Character SHeet*/}
        <Link to="/characters">CHARACTERS</Link>
        <div className="flex px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
