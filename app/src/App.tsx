import { FamilyTreeNodeData, TreeNode } from "./rspc/bindings";
import { rspc } from "./rspc/router";

function App() {
  const cargoVersion = rspc.useQuery(["display_tree", 1]);

  return (
    <div>
      {cargoVersion.data?.nodes.map((n) => (
        <Node id={n.id} key={n.id} nodeData={n.nodeData} />
      ))}
    </div>
  );
}

function Node({ id, nodeData }: { id: string; nodeData: TreeNode<FamilyTreeNodeData>["nodeData"] | null }) {
  return (
    <div>
      <p>{id}</p>
      {nodeData && <p>{JSON.stringify(nodeData)}</p>}
    </div>
  );
}

export default App;
