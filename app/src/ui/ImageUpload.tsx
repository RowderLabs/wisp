import { useEffect, useMemo, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { HiPhoto } from "react-icons/hi2";
import { downloadDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export default function ImageUpload() {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleClick = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Image", extensions: ["png", "jpeg"] }],
      defaultPath: await downloadDir(),
    });

    if (Array.isArray(selected)) throw new Error("Unexpected");

    setImagePath(selected);
  };

  useEffect(() => {
    (async () => {
      if (imagePath) {
        const image = await convertFileSrc(imagePath);
        setImage(image);
      }
      return null;
    })();
  }, [imagePath]);

  return image ? (
    <ImageUploadImage src={image} />
  ) : (
    <ImageUploadUploader handleClick={handleClick} />
  );
}

const ImageUploadUploader = ({ handleClick }: { handleClick: () => Promise<void> }) => {
  return (
    <div
      onClick={handleClick}
      className="w-full h-full flex justify-center border-2 border-dashed items-center cursor-pointer"
    >
      <div className="flex flex-col items-center gap-2 text-slate-800">
        <span className="text-[32px]">
          <HiPhoto />
        </span>
      </div>
    </div>
  );
};

const ImageUploadImage = ({ src }: { src: string }) => {
  return <img src={src} className="object-center object-contain w-full h-full block rounded-md" />;
};
