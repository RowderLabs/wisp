import { cva } from "class-variance-authority";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/dialog";
import React from "react";
import { Button } from "./Button";
const fileDropperVariants = cva("border p-2 min-h-[200px] min-w-[300px] bg-white", {
  variants: {
    over: {
      true: "bg-blue-200",
    },
  },
});
export function FileDropper() {
  const [over, setOver] = React.useState(false);
  React.useEffect(() => {
    const unlistenFileDrop = listen('tauri://file-drop-hover', (res) => console.log(res));

    return () => {
      unlistenFileDrop.then((f) => f());
    };
  }, []);

  const openDialog = () => {
    open({ multiple: true, directory: false }).then((res) => {
      if (res) {
        console.log(res);
      }
    });
  };


  return (
    <div>
      <div
        className={fileDropperVariants({ over })}

      ></div>
      <Button onClick={openDialog} variant="outline">
        Upload
      </Button>
    </div>
  );
}
