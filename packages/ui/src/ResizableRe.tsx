import { cva } from "class-variance-authority";
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ResizableContextType = {
  resizing: boolean;
  onResizeStart: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    handlePos: ResizableHandleProps["position"]
  ) => void;
};

const ResizableContext = createContext<ResizableContextType | null>(null);

const useResizableContext = () => {
  const context = useContext(ResizableContext);
  if (!context) throw new Error("No resize context defined");
  return context as ResizableContextType;
};

function ResizeProvider({
  resizing,
  onResizeStart,
  children,
}: PropsWithChildren<ResizableContextType>) {
  return (
    <ResizableContext.Provider value={{ resizing, onResizeStart }}>
      {children}
    </ResizableContext.Provider>
  );
}

export function Root({ children }: PropsWithChildren) {
  const resizable = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);
  const lastResizeHandle = useRef<ResizableHandleProps["position"]>();
  const dragStartDimensions = useRef<{ width: number; height: number }>();
  const dragStartMousePos = useRef<{ x: number; y: number }>();
  const dragStartPos = useRef<{ x: number; y: number }>();

  const resizeBottomLeft = (e: MouseEvent) => {
    const new_width =
      dragStartDimensions.current!.width - (e.clientX - dragStartMousePos.current!.x);
    const new_x = dragStartPos.current!.x + (e.clientX - dragStartMousePos.current!.x);

    resizable.current!.style.width = new_width + "px";
    resizable.current!.style.left = new_x + "px";
  };

  const resizeTopLeft = (e: MouseEvent) => {
    const width = dragStartDimensions.current!.width - (e.clientX - dragStartMousePos.current!.x);
    const height = dragStartDimensions.current!.height - (e.clientY - dragStartMousePos.current!.y);
    const new_x = dragStartPos.current!.x + (e.clientX - dragStartMousePos.current!.x);
    const new_y = dragStartPos.current!.y + (e.clientY - dragStartMousePos.current!.y);
    resizable.current!.style.width = width + "px";
    resizable.current!.style.height = height + "px";
    resizable.current!.style.left = new_x + "px";
    resizable.current!.style.top = new_y + "px";
  };

  const resizeBottomRight = (e: MouseEvent) => {
    const width = dragStartDimensions.current!.width + (e.clientX - dragStartMousePos.current!.x);
    const height = dragStartDimensions.current!.height + (e.clientY - dragStartMousePos.current!.y);
    resizable.current!.style.width = width + "px";
    resizable.current!.style.height = height + "px";
  };

  const resizeTopRight = (e: MouseEvent) => {
    const width = dragStartDimensions.current!.width + (e.clientX - dragStartMousePos.current!.x);
    const height = dragStartDimensions.current!.height - (e.clientY - dragStartMousePos.current!.y);
    const new_y = dragStartPos.current!.y + (e.clientY - dragStartMousePos.current!.y);
    resizable.current!.style.width = width + "px";
    resizable.current!.style.height = height + "px";
    resizable.current!.style.top = new_y + "px";
  };

  const onResize = (e: MouseEvent) => {
    if (lastResizeHandle.current === "bottom-left") {
      resizeBottomLeft(e);
    } else if (lastResizeHandle.current === "bottom-right") {
      resizeBottomRight(e);
    } else if (lastResizeHandle.current === "top-right") {
      resizeTopRight(e);
    }
    else {
        resizeTopLeft(e)
    }
  };

  const onResizeStart = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    handlePos: ResizableHandleProps["position"]
  ) => {
    setResizing(true);
    lastResizeHandle.current = handlePos;
    dragStartDimensions.current = {
      width: resizable.current!.getBoundingClientRect().width,
      height: resizable.current!.getBoundingClientRect().height,
    };
    dragStartMousePos.current = { x: e.pageX, y: e.pageY };
    dragStartPos.current = {
      x: resizable.current!.getBoundingClientRect().left,
      y: resizable.current!.getBoundingClientRect().top,
    };
    window.addEventListener("mouseup", onResizeEnd);
    window.addEventListener("mousemove", onResize);
  };

  const onResizeEnd = (e: MouseEvent) => {
    setResizing(false);
    window.removeEventListener("mouseup", onResizeEnd);
    window.removeEventListener("mousemove", onResize);
  };

  return (
    <ResizeProvider onResizeStart={onResizeStart} resizing={resizing}>
      <div className="border absolute pointer-events-none" ref={resizable}>
        <span className="pointer-events-auto">{children}</span>
      </div>
    </ResizeProvider>
  );
}

type ResizableHandleProps = {
  position: "bottom-left" | "top-left" | "bottom-right" | "top-right";
};

const resizableHandleVariants = cva(
  "absolute pointer-events-auto h-4 w-4 z-50 rounded-full bg-blue-200",
  {
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
  }
);

function Handle({ position }: ResizableHandleProps) {
  const { onResizeStart } = useResizableContext();
  return (
    <div
      className={resizableHandleVariants({ position })}
      onMouseDown={(e) => {
        e.preventDefault();
        onResizeStart(e, position);
      }}
    ></div>
  );
}

export const ResizableRe = {
  Root,
  Handle,
};
