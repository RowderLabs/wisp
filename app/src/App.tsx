import { rspc } from "./rspc/router";

function App() {
  const cargoVersion = rspc.useQuery(['display_tree', 1])
  return (
    <div>
      <p>{JSON.stringify(cargoVersion.data)}</p>
    </div>
  );
}

export default App;
