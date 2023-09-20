import { useEffect, useRef } from "react";
import { FamilyTreeNodeData, TreeNode } from "./rspc/bindings";
import { rspc } from "./rspc/router";
import * as d3 from "d3";
import pfp from "./assets/pfp.png";
import { createChildPath } from "./paths";
import Binder from "./ui/Binder";

function App() {
  const treeContainerRef = useRef<SVGSVGElement>(null);
  const treeRef = useRef<SVGGElement>(null);
  const binder = rspc.useQuery(['binder.characters', null])
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

  const childrenPaths = treeData.data?.links().map((link) => {
    if (!link.source.parent) return null;
    const path = createChildPath(link);
    if (!path) return null;
    return (
      <path
        key={Math.random() * 4}
        d={path}
        fill={"transparent"}
        stroke="black"
        strokeWidth={"2"}
        strokeLinecap={"round"}
        strokeLinejoin="round"
      />
    );
  });

  const nodes = treeData.data
    ? treeData.data
        .descendants()
        .filter((n) => !n.data.hidden)
        .map((node) => {
          return (
            <g
              key={`n-${Math.random() * 4}`}
              height={125}
              width={75}
              transform={`translate(${node.x - 75 / 2}, ${node.y - 125 / 2})`}
            >
              <rect stroke="black" strokeWidth="3" width="75px" height="125px" fill="black" />
              <svg width="75px" height="125px" viewBox="0 0 75 125">
                <image preserveAspectRatio="xMidYMid slice" href={pfp} x="0" y="0" width="100%" height="100%" />
              </svg>
              <text x={75 / 2} y={125 + 15} fontSize="0.8em" textAnchor="middle">
                {node.data.nodeData?.name}
              </text>
            </g>
          );
        })
    : [];

  return (
    <div className="flex gap-4 h-screen">
      <div className="h-full shadow-md border">
        {JSON.stringify(binder.data)}
      </div>
      <div style={{ width: "1200px", height: "600px" }}>
        <svg ref={treeContainerRef} viewBox="0 0 1200 600">
          <g ref={treeRef}>
            {childrenPaths}
            {nodes}
          </g>
        </svg>
      </div>
    </div>
  );
}

export default App;
