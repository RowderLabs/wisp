import { useEffect, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { HiPhoto } from "react-icons/hi2";
import { downloadDir } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { cva, type VariantProps } from "class-variance-authority";


const uploadableImageVariants = cva("absolute top-0 left-0 w-full h-full text-slate-600");

const uploadedImageVariants = cva("w-full h-full block rounded-md", {
  variants: {
    position: {
      center: "object-center",
      bottom: "object-bottom",
      left: "object-left",
      right: "object-right",
    },
    fit: { cover: "object-cover", contain: "object-contain" },
  },
  defaultVariants: {
    position: "center",
    fit: "cover",
  },
});

const imageUploaderVariants = cva(
  "w-full h-full rounded-md flex justify-center border-2 border-slate-500 border-dashed items-center cursor-pointer"
);

type UploadableImageProps = {
  onUpload?: () => void;
  uploadedImage?: VariantProps<typeof uploadedImageVariants>;
} & VariantProps<typeof uploadableImageVariants>;

export default function UploadableImage({ uploadedImage, onUpload }: UploadableImageProps) {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleUpload = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Image", extensions: ["png", "jpeg"] }],
      defaultPath: await downloadDir(),
    });

    if (Array.isArray(selected)) throw new Error("Unexpected");

    setImagePath(selected);
    if (onUpload) onUpload();
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

  return (
    <div className={uploadableImageVariants()}>
      {image ? (
        <UploadedImage {...uploadedImage} src={image} />
      ) : (
        <ImageUploadUploader handleClick={handleUpload} />
      )}
    </div>
  );
}

const ImageUploadUploader = ({ handleClick }: { handleClick: () => Promise<void> }) => {
  return (
    <div onClick={handleClick} className={imageUploaderVariants()}>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[32px]">
          <HiPhoto />
        </span>
      </div>
    </div>
  );
};

type UploadedImageProps = {
  src: string;
} & VariantProps<typeof uploadedImageVariants>;

const UploadedImage = ({ src, position, fit }: UploadedImageProps) => {
  return <img src={src} className={uploadedImageVariants({ position, fit })} />;
};
