import * as d3 from "d3";

export function createChildPath<T>(d: d3.HierarchyPointLink<T>) {
  let ny = Math.round(d.target.y + (d.source.y - d.target.y) * 0.5);
  let linedata = [
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
