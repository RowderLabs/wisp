import { useFavicon } from "@uidotdev/usehooks";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import throttle from "lodash.throttle";
import clsx from "clsx";
import { cva } from "class-variance-authority";

type ResizableProps = {
  minHeight?: number;
  minWidth?: number;
  restrictToX?: boolean;
  restrictToY?: boolean;
  showResize?: boolean;
};

type ResizableContextType = {
  resizing: boolean;
  onResizeStart: () => void;
};

const ResizableContext = createContext<ResizableContextType | null>(null);

const useResizableContext = () => {
  const context = useContext(ResizableContext);
  if (!context) throw new Error('No resize context defined');
  return context as ResizableContextType;
};

function ResizeProvider({ resizing, onResizeStart, children }: PropsWithChildren<ResizableContextType>) {
  return <ResizableContext.Provider value={{ resizing, onResizeStart }}>{children}</ResizableContext.Provider>;
}

function Root({
  children,
  minHeight,
  minWidth,
  restrictToX = false,
  restrictToY = false,
  showResize = true,
}: PropsWithChildren<ResizableProps>) {
  const resizeRef = useRef<HTMLDivElement | null>(null);
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
    <ResizeProvider resizing={resizing} onResizeStart={onResizeStart}>
      <div
        ref={resizeRef}
        className={clsx("relative w-full h-full pointer-events-none", resizing && "outline outline-blue-200")}
      >
        <span className="pointer-events-auto">{children}</span>
      </div>
    </ResizeProvider>
  );
}

type ResizableHandleProps = {
  position: "bottom-left" | "top-left" | "bottom-right" | "top-right";
};

const resizableHandleVariants = cva("absolute pointer-events-auto h-4 w-4 z-50 rounded-full bg-blue-200", {
  variants: {
    position: {
      "bottom-left": "bottom-[-8px] left-[-8px]",
      "bottom-right": "bottom-[-8px] right-[-8px]",
      "top-left": "top-[-8px] left-[-8px]",
      "top-right": "top-[-8px] right-[-8px]",
    },
    cursor: {
      resize: "cursor-nw-resize",
      default: "cursor-pointer",
    },
  },
});

function Handle({ position }: ResizableHandleProps) {
  const {resizing, onResizeStart} = useResizableContext()
  return (
  <div
    onMouseDown={(e) => {
      e.preventDefault();
      onResizeStart();
    }}
    className={resizableHandleVariants({ position, cursor: resizing ? "resize" : "default" })}
  ></div>);
}

export const Resizable = {
  Root,
  Handle,
};
