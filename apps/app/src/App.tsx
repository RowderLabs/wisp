import { ImageUploadOverlay, ImageUploader, TreeView } from "@wisp/ui";
import { TreeData, useTreeView } from "@wisp/ui/src/hooks";
import CharacterSummary from "./ui/CharacterSummary";
import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";
import { HiChevronDown, HiChevronRight, HiFolder, HiMiniUserCircle } from "react-icons/hi2";

function App() {

  const [_, treeApi] = useTreeView();
  const { data: tree } = rspc.useQuery(["characters.build_tree"]);

  return (
    <div className="flex h-screen bg-neutral text-slate-600">
      <div className="h-full basis-[300px] bg-white">
        {tree && (
          <TreeView
            renderItem={({ name, isCollection, expanded }) => {
              return isCollection ? (
                <>
                  <HiFolder/>
                  {expanded ? <HiChevronDown /> : <HiChevronRight />}
                  <span>{name}</span>
                </>
              ) : (
                <>
                  <HiMiniUserCircle/>
                  <span>{name}</span>
                </>
              );
            }}
            onExpansionChange={treeApi.toggleExpand}
            treeData={tree as TreeData}
            indentation={40}
            {...treeApi}
          />
        )}
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
        <div className="flex px-4">
          <div style={{ height: "800px" }} className="basis-full h-full">
            <div className="w-96">
              <code>{JSON.stringify(tree)}</code>
            </div>
          </div>
          <CharacterSummary name="John" />
        </div>
      </div>
    </div>
  );
}

export default App;
