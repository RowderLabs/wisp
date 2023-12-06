import { DraggableCanvas } from "./DraggableCanvas";

export function PanelCanvas() {
  return (
    <div className="border p-2 relative flex justify-center items-center w-full h-full">
      <div className="absolute top-4 left-4 border h-10 rounded-md flex gap-1 p-0.5">
        <span className="rounded-md h-full w-8 bg-slate-300"></span>
        <span className="rounded-md h-full w-8 bg-slate-300"></span>
        <span className="rounded-md h-full w-8 bg-slate-300"></span>
        <span className="rounded-md h-full w-8 bg-slate-300"></span>
        <span className="rounded-md h-full w-8 bg-slate-300"></span>
      </div>
      <div>
        <DraggableCanvas
          initialItems={[{ id: 1, x: 25, y: 150 }, {id: 2, x: 50, y: 300}]}
        />
      </div>
    </div>
  );
}
