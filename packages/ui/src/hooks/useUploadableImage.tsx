import { useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { downloadDir } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export function useUploadableImage({onUpload, onUploadAsync}: {onUpload?: () => void, onUploadAsync?: () => Promise<void>} = {}) {
    if (onUpload && onUploadAsync) throw new Error('Only one of onUpload or onUploadAsync may be defined at a given time')

    const [image, setImage] = useState<string | null>('')

    const uploadImage = async () => {

        const selectedImage = await open({
            multiple: false,
            filters: [{ name: "Image", extensions: ["png", "jpeg", "webp", "gif"] }],
            defaultPath: await downloadDir(),
          }) as string | null

          if (selectedImage) {
            const uploadedImage = await convertFileSrc(selectedImage)
            setImage(uploadedImage)
            if (onUpload) onUpload()
            if (onUploadAsync) onUploadAsync()
          }

          //TODO: Alert user that upload has failed
    }

    return {image, uploadImage}
}