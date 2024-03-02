
import { createFileRoute } from "@tanstack/react-router";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

export const Route = createFileRoute('/workspace/entity/tree')({
  component: TreePage,
});

export function createChildPath<T>(d: d3.HierarchyPointLink<T>) {
  const ny = Math.round(d.target.y + (d.source.y - d.target.y) * 0.5);
  const linedata = [
    {
      x: d.target.x,
      y: d.target.y,
    },
    {
      x: d.target.x,
      y: ny,
    },
    {
      x: d.source.x,
      y: d.source.y,
    },
  ];

  const drawFunc = d3
    .line<{ x: number; y: number }>()
    .curve(d3.curveStepAfter)
    .x((d) => d.x)
    .y((d) => d.y);

  return drawFunc(linedata);
}

type TreeNode = {id: string, parentId: string | null, meta: {name: string, hidden?: boolean}}
const data: TreeNode[] = [
  {id: '0', parentId: null, meta: {name: 'root', hidden: true},},
  {id: '1', parentId: '0', meta: {name: 'Bob'}},
  {id: '3', parentId: '0', meta: {name: 'Bob-Sarah', hidden: true}},
  {id: '2', parentId: '0', meta: {name: 'Sarah'}},
  {id: '4', parentId: '3', meta: {name: 'James'}}
]
function TreePage() {
  const treeContainerRef = useRef<SVGSVGElement>(null);
  const treeRef = useRef<SVGGElement>(null);
  const hierarchy = d3.stratify<TreeNode>()(data)

  useEffect(() => {
    if (treeContainerRef.current && treeRef.current) {
      const g = d3.select(treeRef.current);
      const svg = d3.select(treeContainerRef.current);
      svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 2]).on("zoom", zoomed));
      // eslint-disable-next-line no-inner-declarations
      function zoomed(e: any) {
        g.attr("transform", e.transform);
      }
    }
  }, [treeContainerRef, treeRef]);

  const treeData = d3.tree<TreeNode>().nodeSize([200, 250]).separation(() => 0.6)(hierarchy)

  /*const childrenPaths = treeData.data?.links().map((link) => {
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
  */

  const nodes = treeData
    ? treeData
        .descendants()
        .filter((n) => !n.data.meta.hidden)
        .map((node) => {
          return (
            <g key={`n-${Math.random() * 4}`} height={125} width={75} transform={`translate(${node.x - 75 / 2}, ${node.y - 125 / 2})`}>
              <rect stroke="black" strokeWidth="3" width="75px" height="125px" fill="black" />
              <svg width="75px" fill="black" height="125px" viewBox="0 0 75 125">
              </svg>
              <text x={75 / 2} y={125 + 15} fill="white" fontSize="0.8em" textAnchor="middle">
                {node.data.meta?.name}
              </text>
            </g>
          );
        })
    : [];

  return (
    <div style={{ width: "1200px", height: "600px" }}>
      <svg ref={treeContainerRef} className="border" viewBox="0 0 1200 600">
        <g ref={treeRef}>
          {nodes}
        </g>
      </svg>
    </div>
  );
}