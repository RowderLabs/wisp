import { cva } from "class-variance-authority";
import { open } from "@tauri-apps/api/dialog";
import {copyFile} from '@tauri-apps/api/fs'
import { Button } from "./Button";
import { nanoid } from "nanoid";
import { appDataDir , join} from "@tauri-apps/api/path";
const fileDropperVariants = cva("border p-2 h-48 w-48 bg-white", {
  variants: {
    over: {
      true: "bg-blue-200",
    },
  },
});

type FileDropperProps = {
  onSubmitFile: (path: string) => void
}
export function FileDropper({onSubmitFile}: FileDropperProps) {
  const openDialog = () => {
    open({ multiple: false, directory: false }).then(async (res) => {
      if (res) {
        if (Array.isArray(res)) return;
        const appData = await appDataDir()
        const imageId = `image-${nanoid(5)}`
        const imagePath = await join(appData, 'wisp_dev', 'assets', imageId)
        await copyFile(res, imagePath).catch(reason => console.error('failed to copy image ' + reason))
        onSubmitFile(imagePath)
      }
    });
  };


  return (
    <div>
      <div
        className={fileDropperVariants()}
      >
      </div>
      <Button onClick={openDialog} variant="outline">
        Upload
      </Button>
    </div>
  );
}
