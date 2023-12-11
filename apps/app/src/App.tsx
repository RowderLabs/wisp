import { ImageUploadOverlay, ImageUploader, PanelCanvas, TreeView } from "@wisp/ui";
import { TreeData, useTreeView } from "@wisp/ui/src/hooks";
import { Banner } from "./ui/Banner";
import WispEditor from "./ui/WispEditor";

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
      <div className="basis-full  px-4">
        <ImageUploader>
          {({ wrapperStyle, ...props }) => (
            <Banner style={wrapperStyle} className="bg-slate-300">
              <ImageUploadOverlay {...props} />
            </Banner>
          )}
        </ImageUploader>
        {/** Character SHeet*/}
        <div className="flex">
          <div style={{height: '800px'}} className="basis-full h-full">
            <PanelCanvas />
          </div>
          <div className="basis-[400px] h-full bg-white p-8 rounded-md mt-[-100px]">
            <div className="flex flex-col gap-2 h-full">
              <ImageUploader wrapperStyle={{ height: "150px", width: "150px", border: '1px solid white', borderRadius: '8px'}}>
                {({ wrapperStyle, ...props }) => (
                  <div style={wrapperStyle} className="mx-auto bg-slate-200">
                    <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
                  </div>
                )}
              </ImageUploader>
              {/**Name */}
              <h2 className="font-semibold text-slate-700 text-lg mx-auto">Holo (The Wise Wolf)</h2>
              <div className="border-b border-2 my-4"></div> 
              {/**Bio*/}
              <p className="font-semibold text-slate-700">Bio</p>
              <div className="h-36 rounded-md">
                <WispEditor />
              </div>
              <div className="border-b border-2 my-4"></div> 
              <p className="font-semibold text-slate-700">Characteristics</p>
              {/**Attributes */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between border-b">
                  <p>Race</p>
                  <p>Wolf God</p>
                </div>
                <div className="flex justify-between border-b">
                  <p>Age</p>
                  <p>300 years old (15)</p>
                </div>
                <div className="flex justify-between border-b">
                  <p>Eye Color</p>
                  <p>Brown</p>
                </div>
                <div className="flex justify-between border-b">
                  <p>Hair Color</p>
                  <p>Brown</p>
                </div>
                <div className="flex justify-between border-b">
                  <p>Eye Color</p>
                  <p>Brown</p>
                </div>
              </div>
               <div className="border-b border-2 my-4"></div> 
              <p className="font-semibold text-slate-700">Characteristics</p>
              {/**Attributes */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between border-b">
                  <p>Race</p>
                  <p>Wolf God</p>
                </div>
                <div className="flex justify-between border-b">
                  <p>Age</p>
                  <p>300 years old (15)</p>
                </div>
                <div className="flex justify-between border-b">
                  <p>Age</p>
                  <p>300 years old (15)</p>
                </div>
                <div className="flex justify-between border-b">
                  <p>Age</p>
                  <p>300 years old (15)</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;
