import { HiPhoto } from "react-icons/hi2";
import { cva, type VariantProps } from "class-variance-authority";
import { useUploadableImage } from "../hooks/useUploadableImage";


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
  "opacity-0 hover:opacity-100 transition-opacity duration-150 ease w-full h-full rounded-md flex justify-center border-2 border-slate-500 border-dashed items-center cursor-pointer"
);

type UploadableImageProps = {
  onUpload?: () => void;
  uploadedImage?: VariantProps<typeof uploadedImageVariants>;
} & VariantProps<typeof uploadableImageVariants>;

export default function UploadableImage({ uploadedImage, onUpload }: UploadableImageProps) {

  const {image, uploadImage} = useUploadableImage({onUpload})

  return (
    <div className={uploadableImageVariants()}>
      {image ? (
        <UploadedImage {...uploadedImage} src={image} />
      ) : (
        <ImageUploadUploader handleUpload={uploadImage} />
      )}
    </div>
  );
}

const ImageUploadUploader = ({ handleUpload }: { handleUpload: () => Promise<void> }) => {
  return (
    <div onClick={handleUpload} className={imageUploaderVariants()}>
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
