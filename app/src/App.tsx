import { useEffect, useRef } from "react";
import { FamilyTreeNodeData, TreeNode } from "./rspc/bindings";
import { rspc } from "./rspc/router";
import * as d3 from "d3";
function App() {
  const treeContainerRef = useRef<SVGSVGElement>(null);
  const treeRef = useRef<SVGGElement>(null);
  const treeData = rspc.useQuery(["display_tree", 1], {
    select: (data) => {
      const hierarchy = d3.stratify<TreeNode<FamilyTreeNodeData>>()(data.nodes);
      console.log(hierarchy);
      return d3
        .tree<TreeNode<FamilyTreeNodeData>>()
        .nodeSize([250, 200])
        .separation((a, b) => (a.data.hidden || b.data.hidden ? 0.3 : 0.6))(hierarchy);
    },
  });

  useEffect(() => {
    if (treeContainerRef.current && treeRef.current) {
      const g = d3.select(treeRef.current);
      const svg = d3.select(treeContainerRef.current);
      svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 2]).on("zoom", zoomed));
      function zoomed(e: any) {
        g.attr("transform", e.transform);
      }
    }
  }, [treeContainerRef, treeRef]);

  const nodes = treeData.data
    ? treeData.data
        .descendants()
        .filter(n => !n.data.hidden)
        .map((node) => {
          return (
            <g key={`n-${Math.random() * 4}`}>
              <rect width={75} height={125} x={node.x + -75 / 2} y={node.y + -125 / 2} />
              <text x={node.x} y={node.y} dominantBaseline={"middle"} textAnchor="middle" fill="white">
                {node.data.nodeData?.name}
              </text>
            </g>
          );
        })
    : [];

  return (
    <div style={{ width: "1200px", height: "600px" }}>
      <svg ref={treeContainerRef} style={{ border: "1px solid black" }} viewBox="0 0 1200 600">
        <g ref={treeRef} x={400} width={1200} height={600}>
          {nodes}
        </g>
      </svg>
    </div>
  );
}

export default App;
