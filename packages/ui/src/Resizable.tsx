import { useFavicon } from "@uidotdev/usehooks";
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import throttle from "lodash.throttle";
import clsx from "clsx";

type ResizableProps = {
  minHeight?: number;
  minWidth?: number;
  restrictToX?: boolean;
  restrictToY?: boolean;
  showResize?: boolean;
};

export function Resizable({
  children,
  minHeight,
  minWidth,
  restrictToX = false,
  restrictToY = false,
  showResize = true
}: PropsWithChildren<ResizableProps>) {
  const resizeRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (restrictToX && restrictToY) throw new Error("You can only restrict to one axis");
  }, []);

  const handleResize = (e: MouseEvent) => {
    if (calculateResize(e, "horizontal") > (minWidth || 0) && !restrictToY)
      resizeRef.current!.style.width = e.clientX - getResizeElem().getBoundingClientRect().left + "px";
    if (calculateResize(e, "vertical") > (minHeight || 0) && !restrictToX)
      resizeRef.current!.style.height = e.clientY - getResizeElem().getBoundingClientRect().top + "px";
  };

  const getResizeElem = () => {
    if (!resizeRef.current) throw new Error("No resize element defined");
    return resizeRef.current;
  };

  const calculateResize = (e: MouseEvent, direction: "horizontal" | "vertical") => {
    switch (direction) {
      case "horizontal": {
        return e.clientX - getResizeElem().getBoundingClientRect().left;
      }
      case "vertical": {
        return e.clientY - getResizeElem().getBoundingClientRect().top;
      }
    }
  };

  const onResizeStart = () => {
    setResizing(true);
    window.addEventListener("mousemove", throttledResize);
    window.addEventListener("mouseup", onResizeEnd);
  };

  const onResizeEnd = () => {
    setResizing(false);
    window.removeEventListener("mousemove", throttledResize);
    window.removeEventListener("mouseup", onResizeEnd);
  };

  useEffect(() => {
    return () => {
      onResizeEnd();
    };
  }, []);

  const throttledResize = useCallback(throttle(handleResize, 5), []);

  return (
    <div
      ref={resizeRef}
      className={clsx("relative w-full h-full pointer-events-none", resizing && "outline outline-blue-200")}
    >
      <div
        ref={dragHandleRef}
        onMouseDown={(e) => {
          e.preventDefault();
          onResizeStart();
        }}
        className={clsx(
          "absolute pointer-events-auto bottom-[-5px] right-[-5px] h-4 w-4 z-50 rounded-full bg-blue-200",
          resizing ? "cursor-nw-resize" : "cursor-pointer"
        )}
      ></div>
      <span className="pointer-events-auto">{children}</span>
    </div>
  );
}
