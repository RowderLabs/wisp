import { useFavicon } from "@uidotdev/usehooks";
import { useEffect, useRef, useState } from "react";

export function Resizable() {
  const resizeRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const [originDimensions, setOriginDimensions] = useState({ width: 0, height: 0 });
  const [startingMousePos, setStartingMousePos] = useState({ x: 0, y: 0 });

  const handleResize = (e: MouseEvent) => {
    if (!resizeRef.current) return;
    setOriginDimensions({
      width: resizeRef.current.getBoundingClientRect().width,
      height: resizeRef.current.getBoundingClientRect().height,
    });
    setStartingMousePos({ y: e.clientY, x: e.clientX });
    resizeRef.current.style.width = e.clientX - resizeRef.current.getBoundingClientRect().left + 'px'
    resizeRef.current.style.height= e.clientY - resizeRef.current.getBoundingClientRect().top + 'px'
  };

  const onResizeStart = () => {
    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", onResizeEnd);
  };

  const onResizeEnd = () => {
    window.removeEventListener("mousemove", handleResize);
    window.removeEventListener("mouseup", onResizeEnd);
  };

  useEffect(() => {
    return () => {
      onResizeEnd();
    };
  }, []);

  return (
    <div ref={resizeRef} className="relative w-[200px] min-h-[200px] border">
      <span>{JSON.stringify(startingMousePos)}</span>
      <div
        ref={dragHandleRef}
        onMouseDown={(e) => {
          e.preventDefault()
          if (!resizeRef.current) return;
          onResizeStart();
        }}
        className="absolute bottom-[-5px] right-[-5px] h-6 w-6 rounded-full bg-blue-200"
      ></div>
    </div>
  );
}
