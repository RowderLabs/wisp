import { rspc } from "./rspc/router";

function App() {
  const cargoVersion = rspc.useQuery(["display_tree", 1]);

  const nodes = cargoVersion.data?.nodes.map((n) => {
    if ("nodeData" in n) {
      return (
        <div>
          <p>Person</p>
          <p>{n.nodeData.name}</p>
          <p>{n.parentId}</p>
        </div>
      );
    }

    return <div>{n.id}</div>

  });


  return (
    <div>
      {nodes}
    </div>
  )
}

export default App;
