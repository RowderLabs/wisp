import { useRef } from "react";
import { DraggableCanvas, DraggableCanvasHandle } from "./DraggableCanvas";
import { HiOutlineAnnotation } from "react-icons/hi";
import { createPanel } from "./Panel";

export function PanelCanvas() {
  const canvasRef = useRef<DraggableCanvasHandle | null>(null);

  const createImagePanel = () => {
    canvasRef.current?.createCanvasItem({
      id: Math.round(Math.random() * 1000).toString(),
      x: Math.floor(Math.random() * 400),
      y: Math.floor(Math.random() * 100),
      renderItem: () => createPanel("textbox").content,
    });
  };

  return (
    <div className="border p-2 relative w-full h-full">
      <div className="absolute top-4 left-4 border h-10 rounded-md flex gap-1 p-0.5">
        <span onClick={createImagePanel} className="rounded-md h-full w-8 flex justify-center items-center hover:bg-blue-500 hover:text-white">
            <HiOutlineAnnotation/>
        </span>
        <span className="rounded-md h-full w-8 bg-slate-300 hover:bg-slate-500"></span>
        <span className="rounded-md h-full w-8 bg-slate-300"></span>
        <span className="rounded-md h-full w-8 bg-slate-300"></span>
        <span className="rounded-md h-full w-8 bg-slate-300"></span>
      </div>
      <div className="w-full h-full">
        <DraggableCanvas
          ref={canvasRef}
        />
      </div>
    </div>
  );
}
