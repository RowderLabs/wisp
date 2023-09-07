import { rspc } from "./rspc/router";

function App() {
  const cargoVersion = rspc.useQuery(['version'])
  return (
    <div>
      <p>{cargoVersion.data}</p>
    </div>
  );
}

export default App;
