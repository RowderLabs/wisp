import Binder from "./ui/Binder";
import { AttributePanel } from "./ui/AttributePanel";
import { Banner } from "./ui/Banner";
import { rspc } from "./rspc/router";

function App() {
  const { data: character } = rspc.useQuery(["characters.with_id", 1]);

  return (
    <div className="flex gap-4 h-screen">
      <div className="h-full w-[300px] shadow-md border">
        <Binder />
      </div>
      <div className="basis-full mx-20">
        <div className="relative">
          <Banner />
          <div className="flex gap-4 px-4 py-2">
            <div className="h-48 w-48 bg-blue-500 rounded-md border-8 border-white mt-[-100px]"></div>
            <h2 className="text-2xl">Lord Blackwood</h2>
          </div>
        </div>
        <div>{JSON.stringify(character)}</div>
        <div className="flex justify-end">
          <div>
            <AttributePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
