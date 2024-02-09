import { cva } from "class-variance-authority";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/dialog";
import React from "react";
import { Button } from "./Button";
import { ImagePanel } from "../panels/image";
import { convertFileSrc } from "@tauri-apps/api/tauri";
const fileDropperVariants = cva("border p-2 min-h-[200px] min-w-[300px] bg-white", {
  variants: {
    over: {
      true: "bg-blue-200",
    },
  },
});
export function FileDropper() {
  const [over, setOver] = React.useState(false);
  const [src, setSrc] = React.useState<string>()
  const openDialog = () => {
    open({ multiple: false, directory: false }).then(async (res) => {
      if (res) {
        if (Array.isArray(res)) return;
        const image = await convertFileSrc(res)
        setSrc(image)
      }
    });
  };


  return (
    <div>
      <div
        className={fileDropperVariants({ over })}

      >
        {src && new ImagePanel({fit: 'contain'}).renderFromJSON(JSON.stringify({src}))}
      </div>
      <Button onClick={openDialog} variant="outline">
        Upload
      </Button>
    </div>
  );
}
