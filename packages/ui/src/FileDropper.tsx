import { cva } from "class-variance-authority";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/dialog";
import {copyFile, BaseDirectory, readBinaryFile} from '@tauri-apps/api/fs'
import React, { useEffect } from "react";
import { Button } from "./Button";
import { nanoid } from "nanoid";
import { ImagePanel } from "../panels/image";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { appDataDir , join} from "@tauri-apps/api/path";
const fileDropperVariants = cva("border p-2 h-[300px] w-[300px] bg-white", {
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
        const appData = await appDataDir()
        const imageId = `image-${nanoid(5)}.png`
        const imagePath = await join(appData, 'wisp_dev', 'assets', imageId)
        await copyFile(res, imagePath).catch(reason => console.error('failed to copy image ' + reason))
        await retriveNewImage(imagePath)
      }
    });
  };

  const retriveNewImage = async (path: string) => {
    const image = await convertFileSrc(path)
    setSrc(image)
  }

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
